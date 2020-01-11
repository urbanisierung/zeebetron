import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  SimpleChange
} from "@angular/core";
import BpmnViewer from "bpmn-js";
import { ElectronService } from "../../core/services";
import { ConfigService } from "../../core/services/config/config.service";
import { Profile, Workflow } from "../../core/types/Profiles.type";
import { FormControl } from "@angular/forms";

@Component({
  selector: "workflow",
  templateUrl: "./workflow.component.html",
  styleUrls: ["./workflow.component.scss"]
})
export class WorkflowComponent implements OnChanges {
  @ViewChild("diagram", null) private el: ElementRef;

  @Input() profile: Profile;
  @Input() workflow: Workflow;

  public workflowName = new FormControl();
  private viewer = new BpmnViewer();
  private workflowFileContent;

  constructor(
    private electronService: ElectronService,
    private configService: ConfigService
  ) {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.setWorkflow();
  }

  public async selectWorkflow() {
    const dialogResponse = await this.electronService.remote.dialog.showOpenDialog(
      {
        filters: [{ name: "bpmn", extensions: ["bpmn"] }],
        properties: ["openFile"]
      }
    );
    if (dialogResponse.canceled) {
      return;
    }

    this.workflow.bpmnFile = dialogResponse.filePaths[0];
    this.displayWorkflow();

    const parser = require("fast-xml-parser");
    const options = {
      attributeNamePrefix: "",
      ignoreAttributes: false
    };
    const json = parser.parse(this.workflowFileContent, options);
    const workflowId = json["bpmn:definitions"]["bpmn:process"].id;

    this.workflow.workflowId = workflowId;
  }

  public saveWorkflow() {
    this.workflow.name = this.workflowName.value;
    if (this.profile.workflows) {
      this.profile.workflows.push(this.workflow);
    } else {
      this.profile.workflows = [this.workflow];
    }
    this.configService.setProfile(this.profile.name, this.profile);
  }

  private setWorkflow() {
    this.workflowName.reset();
    this.workflowName.setValue(this.workflow.name);
    if (this.workflow.name && this.workflow.name.length > 0) {
      this.displayWorkflow();
    }
  }

  private displayWorkflow() {
    const raw: Buffer = this.electronService.fs.readFileSync(
      this.workflow.bpmnFile
    );
    this.workflowFileContent = raw.toString();

    this.viewer.importXML(this.workflowFileContent, error => {
      if (!error) {
        console.log("success!");
        this.viewer.get("canvas").zoom("fit-viewport");
      } else {
        console.log("something went wrong:", error);
      }
    });
    this.viewer.attachTo(this.el.nativeElement);
  }
}

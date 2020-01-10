import { Component, ElementRef, Input, ViewChild } from "@angular/core";
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
export class WorkflowComponent {
  @ViewChild("diagram", null) private el: ElementRef;

  @Input() profile: Profile;
  @Input() workflow: Workflow;

  public workflowName = new FormControl();
  private viewer = new BpmnViewer();

  constructor(private electronService: ElectronService, private configService: ConfigService) {}

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

    const workflowFile = dialogResponse.filePaths[0];
    const raw: Buffer = this.electronService.fs.readFileSync(workflowFile);
    const workflowFileContent = raw.toString();
    const parser = require("fast-xml-parser");
    const options = {
      attributeNamePrefix: "",
      ignoreAttributes: false
    };
    const json = parser.parse(workflowFileContent, options);
    const workflowId = json["bpmn:definitions"]["bpmn:process"].id;
    this.viewer.importXML(workflowFileContent, error => {
      if (!error) {
        console.log("success!");
        this.viewer.get("canvas").zoom("fit-viewport");
      } else {
        console.log("something went wrong:", error);
      }
    });
    this.viewer.attachTo(this.el.nativeElement);

    this.workflow.bpmnFile = workflowFile;
    this.workflow.workflowId = workflowId;
  }
}

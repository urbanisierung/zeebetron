import { Component, ElementRef, ViewChild } from "@angular/core";
import BpmnViewer from "bpmn-js";
import { ElectronService } from "../core/services";
import { ConfigService } from "../core/services/config/config.service";
import { ZeebeService } from "../core/services/zeebe/zeebe.service";
import { Profile } from "../core/types/Profiles.type";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  @ViewChild("ref", null) private el: ElementRef;

  public profiles: string[];
  public currentProfile: Profile;

  public topology: string;
  public workflowFile: string;
  public workflowId: string;
  public workflowFileContent: string;
  public deployResult: string;

  public connected = false;

  private viewer = new BpmnViewer();

  constructor(
    private zeebeService: ZeebeService,
    private configService: ConfigService,
    private electronService: ElectronService
  ) {
    this.configService.load().then(p => {
      console.log(JSON.stringify(p));
      this.profiles = p;
    });
  }

  async onUpdate(deleted: boolean) {
    this.profiles = await this.configService.load();
    if (deleted) {
      this.currentProfile = null;
    }
  }

  public addProfile() {
    this.currentProfile = {
      name: "",
      zeebe: {
        address: "",
        oAuthAvailable: false
      }
    };
  }

  public async selectProfile(name: string) {
    this.currentProfile = await this.configService.getProfile(name);
  }

/* ******************** */

  public async connect() {
    // await this.zeebeService.setup(this.config);
    this.connected = true;
  }

  public async disconnect() {
    await this.zeebeService.close();
    this.connected = false;
  }

  public async showTopology() {
    this.topology = await this.zeebeService.getTopology();
  }

  public async deployWorkflow() {
    const result = await this.zeebeService.deployWorkflow(this.workflowFile);
    this.deployResult = JSON.stringify(result);
  }

  public async startWorkflow() {
    const result = await this.zeebeService.startWorkflow(this.workflowId, {
      name: "test"
    });
    console.log(JSON.stringify(result));
  }

  public async selectWorkflow() {
    this.electronService.remote.dialog
      .showOpenDialog({
        filters: [{ name: "bpmn", extensions: ["bpmn"] }],
        properties: ["openFile"]
      })
      .then(dialogResponse => {
        if (!dialogResponse.canceled) {
          this.workflowFile = dialogResponse.filePaths[0];
          const raw: Buffer = this.electronService.fs.readFileSync(
            this.workflowFile
          );
          this.workflowFileContent = raw.toString();
          const parser = require("fast-xml-parser");
          const options = {
            attributeNamePrefix: "",
            ignoreAttributes: false
          };
          const json = parser.parse(this.workflowFileContent, options);
          this.workflowId = json["bpmn:definitions"]["bpmn:process"].id;
          // this.viewer.destroy();
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
      });
  }
}

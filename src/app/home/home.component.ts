import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ConfigService } from "../core/services/config/config.service";
import { ZeebeService } from "../core/services/zeebe/zeebe.service";
import { ElectronService } from "../core/services";
import BpmnViewer from "bpmn-js";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  @ViewChild("ref", null) private el: ElementRef;

  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();
  private config;

  public topology: string;
  public workflowFile: string;
  public workflowId: string;
  public workflowFileContent: string;
  public deployResult: string;

  private viewer = new BpmnViewer();

  constructor(
    private zeebeService: ZeebeService,
    private configService: ConfigService,
    private electronService: ElectronService
  ) {
    const promise = this.configService.get();
    promise.then(c => {
      if (c) {
        this.config = c;
        console.log(JSON.stringify(c));
        this.clusterId.setValue(c.clusterId);
        this.baseUrl.setValue(c.baseUrl);
        this.clientId.setValue(c.clientId);
        this.clientSecret.setValue(c.clientSecret);
        this.authUrl.setValue(c.authUrl);
      }
    });
  }

  ngOnInit(): void {}

  public async showTopology() {
    await this.zeebeService.setup(this.config);
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

  public async saveConfig() {
    this.config = {
      clusterId: this.clusterId.value,
      baseUrl: this.baseUrl.value,
      clientId: this.clientId.value,
      clientSecret: this.clientSecret.value,
      authUrl: this.authUrl.value
    };
    await this.configService.save(this.config);
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

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ConfigService } from "../core/services/config/config.service";
import { ZeebeService } from "../core/services/zeebe/zeebe.service";
import { ElectronService } from "../core/services";
import BpmnViewer from "bpmn-js";
import { Profile } from "../core/types/Profiles.type";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  @ViewChild("ref", null) private el: ElementRef;

  public profiles: string[];
  public currentProfile: Profile;

  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public profileName = new FormControl();
  public address = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();
  private config;

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
    const promise = this.configService.get();
    promise.then(c => console.log(JSON.stringify(c)));
    // const promise = this.configService.get();
    // promise.then(c => {
    //   if (c) {
    //     this.config = c;
    //     console.log(JSON.stringify(c));
    //     this.clusterId.setValue(c.clusterId);
    //     this.baseUrl.setValue(c.baseUrl);
    //     this.clientId.setValue(c.clientId);
    //     this.clientSecret.setValue(c.clientSecret);
    //     this.authUrl.setValue(c.authUrl);
    //   }
    // });
  }

  ngOnInit(): void {}

  public addProfile() {
    this.authUrl.reset();
    this.clientId.reset();
    this.clientSecret.reset();
    this.address.reset();
    this.profileName.reset();
    this.currentProfile = {
      name: "",
      zeebe: {
        address: ""
      }
    };
  }

  public async selectProfile(name: string) {
    this.currentProfile = await this.configService.getProfile(name);
    this.authUrl.setValue(this.currentProfile.zeebe.oAuth.authzUrl);
    this.clientId.setValue(this.currentProfile.zeebe.oAuth.clientId);
    this.clientSecret.setValue(this.currentProfile.zeebe.oAuth.clientSecret);
    this.address.setValue(this.currentProfile.zeebe.address);
    this.profileName.setValue(this.currentProfile.name);
  }

  public async connect() {
    await this.zeebeService.setup(this.config);
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

  public async saveProfile() {
    this.currentProfile = {
      name: this.profileName.value,
      zeebe: {
        address: this.address.value,
        oAuth: {
          clientId: this.clientId.value,
          clientSecret: this.clientSecret.value,
          authzUrl: this.authUrl.value
        }
      }
    };
    this.profiles = await this.configService.setProfile(
      this.profileName.value,
      this.currentProfile
    );
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

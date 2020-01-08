import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ConfigService } from "../core/services/config/config.service";
import { ZeebeService } from "../core/services/zeebe/zeebe.service";
import { ElectronService } from "../core/services";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();
  private config;

  public topology: string;
  public workflowFile: string;
  public deployResult: string;

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
        }
      });
  }
}

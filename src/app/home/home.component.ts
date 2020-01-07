import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ConfigService } from "../core/services/config/config.service";
import { ZeebeService } from "../core/services/zeebe/zeebe.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  public topology: string;
  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();
  private config;

  constructor(
    private zeebeService: ZeebeService,
    private configService: ConfigService
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
}

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ConfigService } from "../../core/services/config/config.service";
import { Profile, Workflow } from "../../core/types/Profiles.type";
import { ZeebeService } from "../../core/services/zeebe/zeebe.service";
import { MatSelectChange } from "@angular/material";

@Component({
  selector: "profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnChanges {
  @Input() profile: Profile;
  @Output() update = new EventEmitter<boolean>();
  @Output() log = new EventEmitter<string>();

  public oAuth = false;
  public currentWorkflow: Workflow;

  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public profileName = new FormControl();
  public address = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();

  constructor(
    public zeebeService: ZeebeService,
    private configService: ConfigService
  ) {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.setProfile();
  }

  public async deleteProfile() {
    await this.configService.deleteProfile(this.profile.name);
    this.profile = null;
    this.update.emit(true);
    this.resetFields();
  }

  public async saveProfile() {
    const oAuth = this.oAuth
      ? {
          clientId: this.clientId.value,
          clientSecret: this.clientSecret.value,
          authzUrl: this.authUrl.value
        }
      : null;
    this.profile.name = this.profileName.value;
    this.profile.zeebe = {
      address: this.address.value,
      oAuthAvailable: this.oAuth,
      oAuth
    };
    await this.configService.setProfile(this.profile.name, this.profile);
    this.update.emit(false);
  }

  public changeOAuthToggle(oAuth: boolean) {
    this.oAuth = oAuth;
  }

  public changeWorkflowSelection(event: MatSelectChange) {
    this.currentWorkflow = event.value;
  }

  public async status() {
    const status = await this.zeebeService.status(this.profile);
    this.log.emit(JSON.stringify(status, null, 2));
  }

  public addWorkflow() {
    this.currentWorkflow = {
      name: "",
      bpmnFile: "unset",
      workflowId: "unset"
    };
  }

  private async setProfile() {
    this.resetFields();

    this.currentWorkflow = null;

    this.profileName.setValue(this.profile.name);
    this.address.setValue(this.profile.zeebe.address);

    this.oAuth = this.profile.zeebe.oAuthAvailable;
    if (this.profile.zeebe.oAuthAvailable) {
      this.authUrl.setValue(this.profile.zeebe.oAuth.authzUrl);
      this.clientId.setValue(this.profile.zeebe.oAuth.clientId);
      this.clientSecret.setValue(this.profile.zeebe.oAuth.clientSecret);
    } else {
      this.authUrl.reset();
      this.clientId.reset();
      this.clientSecret.reset();
    }
  }

  private resetFields() {
    this.authUrl.reset();
    this.clientId.reset();
    this.clientSecret.reset();
    this.address.reset();
    this.profileName.reset();
    this.oAuth = false;
  }
}

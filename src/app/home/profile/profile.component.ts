import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ConfigService } from "../../core/services/config/config.service";
import { Profile } from "../../core/types/Profiles.type";

@Component({
  selector: "profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnChanges {
  @Input() profile: Profile;
  @Output() update = new EventEmitter<boolean>();

  public oAuth = false;

  public clusterId = new FormControl();
  public baseUrl = new FormControl();
  public profileName = new FormControl();
  public address = new FormControl();
  public clientId = new FormControl();
  public clientSecret = new FormControl();
  public authUrl = new FormControl();

  constructor(private configService: ConfigService) {}

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      let to = JSON.stringify(changedProp.currentValue);
      if (changedProp.isFirstChange()) {
        console.log(`Initial value of ${propName} set to ${to}`);
      } else {
        let from = JSON.stringify(changedProp.previousValue);
        console.log(`${propName} changed from ${from} to ${to}`);
      }
    }
    console.log(`NEW VALUE: ${JSON.stringify(this.profile)}`);
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
    this.profile = {
      name: this.profileName.value,
      zeebe: {
        address: this.address.value,
        oAuthAvailable: this.oAuth,
        oAuth
      }
    };
    await this.configService.setProfile(this.profile.name, this.profile);
    this.update.emit(false);
  }

  public changeOAuthToggle(oAuth: boolean) {
    this.oAuth = oAuth;
  }

  private async setProfile() {
    this.resetFields();

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

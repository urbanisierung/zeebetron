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

  constructor(
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
      },
      workflows: []
    };
  }

  public async selectProfile(name: string) {
    this.currentProfile = await this.configService.getProfile(name);
  }

}

import { Injectable } from "@angular/core";
import { Profile } from "../../types/Profiles.type";
import { ZeebeLogService } from "./zeebeLog.service";

@Injectable({
  providedIn: "root"
})
export class ZeebeService {
  private zeebeClient;
  private zb;
  private connected = false;

  constructor(private zeebeLogService: ZeebeLogService) {
    this.zb = window.require("zeebe-node");
  }

  public async connect(profile: Profile): Promise<boolean> {
    const oAuth = profile.zeebe.oAuthAvailable
      ? {
          oAuth: {
            url: profile.zeebe.oAuth.authzUrl,
            audience: profile.zeebe.address.split(":")[0],
            clientId: profile.zeebe.oAuth.clientId,
            clientSecret: profile.zeebe.oAuth.clientSecret,
            cacheOnDisk: true
          }
        }
      : null;
    console.log(JSON.stringify("oAuth: " + JSON.stringify(oAuth)));
    try {
      this.zeebeClient = await new this.zb.ZBClient(
        profile.zeebe.address,
        oAuth
      );
      this.connected = true;
    } catch (e) {
      this.zeebeLogService.add(`cannot connect: ${JSON.stringify(e)}`);
    }
    return this.connected;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async close() {
    await this.zeebeClient.close();
    this.connected = false;
  }

  public async status(
    profile: Profile,
    leaveConnectionOpen: boolean = false
  ): Promise<any> {
    this.zeebeLogService.add(`$ status for ${profile.name}`);
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const status = await this.zeebeClient.topology();
    this.zeebeLogService.add(JSON.stringify(status, null, 2));
    if (!leaveConnectionOpen) {
      this.close();
    }

    return status;
  }

  public async createInstance(
    profile: Profile,
    workflowId: string,
    payload: any,
    leaveConnectionOpen: boolean = false
  ): Promise<any> {
    this.zeebeLogService.add(`$ creating instance for profile ${profile.name} and workflow id ${workflowId}`);
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const result = await this.zeebeClient.createWorkflowInstance(
      workflowId,
      payload
    );
    this.zeebeLogService.add(JSON.stringify(result, null, 2));
    if (!leaveConnectionOpen) {
      this.close();
    }
    return result;
  }

  public async deploy(
    profile: Profile,
    bpmnFile: string,
    leaveConnectionOpen: boolean = false
  ): Promise<any> {
    this.zeebeLogService.add(`$ deploying to profile ${profile.name}`);
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const result = await this.zeebeClient.deployWorkflow(bpmnFile);
    this.zeebeLogService.add(JSON.stringify(result, null, 2));
    if (!leaveConnectionOpen) {
      this.close();
    }
    return result;
  }
}

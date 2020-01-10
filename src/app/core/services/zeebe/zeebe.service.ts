import { Injectable } from "@angular/core";
import { Profile } from "../../types/Profiles.type";

@Injectable({
  providedIn: "root"
})
export class ZeebeService {
  private zeebeClient;
  private zb;
  private connected = false;

  constructor() {
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
      console.log(`cannot connect: ${JSON.stringify(e)}`);
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
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const status = await this.zeebeClient.topology();
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
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const result = await this.zeebeClient.createWorkflowInstance(
      workflowId,
      payload
    );
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
    if (!this.connected) {
      if (!(await this.connect(profile))) {
        return `cannot connect to zeebe`;
      }
    }
    const result = await this.zeebeClient.deployWorkflow(bpmnFile);
    if (!leaveConnectionOpen) {
      this.close();
    }
    return result;
  }
}

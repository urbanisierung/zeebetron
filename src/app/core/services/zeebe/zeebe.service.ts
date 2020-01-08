import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ZeebeService {
  private zeebeClient;
  private zb;

  constructor() {
    this.zb = window.require("zeebe-node");
  }

  public async setup(config) {
    this.zeebeClient = new this.zb.ZBClient(
      `${config.clusterId}.${config.baseUrl}:443`,
      {
        oAuth: {
          url: config.authUrl,
          audience: config.clusterId + "." + config.baseUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          cacheOnDisk: true
        }
      }
    );
  }

  public async close() {
    await this.zeebeClient.close();
  }

  public async getTopology(): Promise<string> {
    console.log(`fetching topology`);
    const topology = await this.zeebeClient.topology();
    return JSON.stringify(topology, null, 2);
  }

  public async startWorkflow(workflowId: string, payload: any): Promise<any> {
    const result = await this.zeebeClient.createWorkflowInstance(
      workflowId,
      payload
    );
    return result;
  }

  public async deployWorkflow(bpmnFile: string): Promise<any> {
    console.log(`deploying workflow instance`);
    const result = await this.zeebeClient.deployWorkflow(bpmnFile);
    return result;
  }
}

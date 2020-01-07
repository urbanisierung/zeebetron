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

  public async getTopology() {
    console.log(`fetching topology`);
    const topology = await this.zeebeClient.topology();
    return JSON.stringify(topology, null, 2);
  }
}

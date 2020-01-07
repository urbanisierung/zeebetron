import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private store;
  private es;

  constructor() {
    this.es = window.require("electron-store");
    this.store = new this.es();
  }

  public async save(values) {
    await this.store.set("default", values);
  }

  public async get() {
    return await this.store.get("default");
  }
}

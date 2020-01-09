import { Injectable } from "@angular/core";
import { Profile } from "../../types/Profiles.type";
import { stringify } from "querystring";

const PROFILE_KEY = "profiles";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private store;
  private es;
  private profiles: string[];

  constructor() {
    this.es = window.require("electron-store");
    this.store = new this.es();
  }

  public async setProfile(name: string, profile: Profile): Promise<string[]> {
    if (!this.profiles.includes(name)) {
      this.profiles.push(name);
      await this.store.set(PROFILE_KEY, this.profiles);
    }
    await this.store.set(name, profile);
    return this.profiles;
  }

  public getProfiles(): string[] {
    return this.profiles;
  }

  public async getProfile(name: string): Promise<Profile> {
    const profile = await this.store.get(name);
    return profile;
  }

  public async save(values) {
    await this.store.set("default", values);
  }

  public async get() {
    return await this.store.get("default");
  }

  public async load(): Promise<string[]> {
    // this.store.delete(PROFILE_KEY);
    // return;
    const p = await this.store.get(PROFILE_KEY);
    if (p) {
      console.log("found profiles...");
      this.profiles = p;
    } else {
      console.log("creating empty array");
      this.profiles = [];
    }
    return this.profiles;
  }
}

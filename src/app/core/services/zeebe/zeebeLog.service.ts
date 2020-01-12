import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ZeebeLogService {
  private log: string[] = [];

  public add(log: string) {
    this.log.push(log);
  }

  public get(): string {
    return this.log.join("\n");
  }

  public logs(): string[] {
    return this.log;
  }
}

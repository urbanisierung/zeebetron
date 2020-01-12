import { Component, OnInit, Input } from "@angular/core";
import { ZeebeLogService } from "../../core/services/zeebe/zeebeLog.service";

@Component({
  selector: "log",
  templateUrl: "./log.component.html",
  styleUrls: ["./log.component.scss"]
})
export class LogComponent {
  constructor(public zeebeLogService: ZeebeLogService) {}
}

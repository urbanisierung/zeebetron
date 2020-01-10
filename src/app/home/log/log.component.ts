import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent {

  @Input() log: string;

  constructor() { }
}

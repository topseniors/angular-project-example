import { Component, Input } from '@angular/core';

const INFO = 'info';
const ERROR = 'error';

@Component({
  selector: 'app-alert-panel',
  templateUrl: './alert-panel.component.html',
  styleUrls: ['./alert-panel.component.less']
})
export class AlertPanelComponent {
  @Input() type: string;
  @Input() message: string;

  constructor() { }

  isInfo(): boolean {
    return (this.type === INFO);
  }

  isError(): boolean {
    return (this.type === ERROR);
  }
}

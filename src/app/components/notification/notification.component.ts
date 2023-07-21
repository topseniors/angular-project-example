import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material';

export interface MatSnackBarInjectedData {
  httpError?: boolean;
  status?: number;
  operationError?: boolean;
  title: string;
  subTitle?: string;
  actionLabel?: string;
  action?: any;
}

@Component({
  selector    : 'app-notification',
  templateUrl : './notification.component.html',
  styleUrls   : ['./notification.component.less']
})
export class NotificationComponent implements OnInit {
  public actionLabel: string = this.data.actionLabel || 'GENERAL.DISMISS';

  constructor(
    public snackBar: MatSnackBar,
    @Inject(MAT_SNACK_BAR_DATA) public data: MatSnackBarInjectedData
  ) {}

  ngOnInit() {}

  public action() {
    this.snackBar.dismiss();

    if (this.data.action) {
      this.data.action();
    }
  }
}

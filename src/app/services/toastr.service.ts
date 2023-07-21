import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { NotificationComponent, MatSnackBarInjectedData } from 'app/components/notification/notification.component';
import { APIResult } from 'app/services/apis/api.service';

interface SnackBarOptions {
  duration?: number;
  data: MatSnackBarInjectedData;
}

export interface Action {
  action: any;
  actionLabel: string;
}

@Injectable()
export class ToastrService {

  constructor(private snackBar: MatSnackBar) { }

  public show(
    customData: MatSnackBarInjectedData = null,
    result: APIResult<any> = null,
    duration: number = 5000,
    hideSuccessSubTitle: boolean = true,
    customAction: Action = null
  ): void {
    let injectedData: MatSnackBarInjectedData;

    if (customData) {
      injectedData = customData;
    } else {
      const operationError = !result.success;
      const title = (operationError) ? 'GENERAL.OPERATION_ERROR_TITLE' : 'GENERAL.OPERATION_SUCCESS_TITLE';
      const subTitle = (operationError) ?
        (result.data && result.data.message) || (result.messages && result.messages.join('\n')) || result.msg
        : (!hideSuccessSubTitle && result.message) || '';
      injectedData = { operationError, title, subTitle };
      if (customAction) {
        injectedData = { ...injectedData, ...customAction };
      }
    }

    const snackBarOptions: SnackBarOptions = { data: injectedData };
    if (duration) {
      snackBarOptions.duration = duration;
    }

    this.snackBar.openFromComponent(NotificationComponent, snackBarOptions);
  }
}

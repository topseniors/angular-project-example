import { Injectable } from '@angular/core';
import { ApiService, APIResult } from './api.service';
import { Observable } from 'rxjs/Rx';
import { MatSnackBarInjectedData } from 'app/components/notification/notification.component';
import { ToastrService } from 'app/services/toastr.service';

export interface TimeZone {
  id: string;
  offset?: number;
  shortDesc?: string;
  tzkey?: string;
}

export interface PasswordPolicy {
  requiredLowercase: number;
  default: boolean;
  forcePassChange: number;
  requiredUppercase: number;
  minimumLength: number;
  passwordHistory: number;
  maximumAge: number;
  requiredNumeric: number;
  requiredSpecial: number;
}

export type TimeZoneAPIResult = APIResult<TimeZone>;
export type PasswordPolicyAPIResult = APIResult<PasswordPolicy>;

@Injectable()
export class TenantService {

  constructor(private apiService: ApiService, private toastrService: ToastrService) { }

  public getAvailableApplianceTimeZones(orgId: string): Observable<TimeZoneAPIResult> {
    const uri = `orgs/${orgId}/timezones`;

    return this.apiService.callApi('GET', uri)
      .do((result: TimeZoneAPIResult) => {
        if (result.success) return;

        const injectedData: MatSnackBarInjectedData = {
          operationError: true,
          title: 'GENERAL.TIMEZONE_ERROR_TITLE',
          subTitle: (result.data && result.data.message) || result.msg
        };

        this.toastrService.show(injectedData, null);
      })
      .share();
  }

  public getPasswordPolicy(orgId: string): Observable<PasswordPolicyAPIResult> {
    const uri = `orgs/passwordPolicy`;
    const params = {
      _dc: 1517862522915,
      page: 1,
      start: 0,
      limit: 50
    };

    return this.apiService.callApi('GET', uri, params)
      .do((result: PasswordPolicyAPIResult) => {
        if (result.success) return;

        const injectedData: MatSnackBarInjectedData = {
          operationError: true,
          title: 'GENERAL.PASSWORD_POLICY_ERROR_TITLE',
          subTitle: (result.data && result.data.message) || result.msg
        };

        this.toastrService.show(injectedData, null);
      })
      .share();
  }
}

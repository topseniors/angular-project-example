import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, APIResult } from './api.service';
import { ToastrService } from '../toastr.service';
import { LoginService } from './login.service';

export interface UserInfoUpdatePayload {
  name: string;
  login: string;
  email: string;
  preferences: any;
}

export interface UserPasswordUpdatePayload {
  id: string;
  oldpassword: string;
  password: string;
  password_confirmation: string;
}

export type UserAPIResult = APIResult<any>;

@Injectable()
export class UserService {

  constructor(
    private apiService: ApiService,
    private loginService: LoginService,
    private toastrService: ToastrService
  ) { }

  public updateUserInfo(userId: string, payload: UserInfoUpdatePayload): Observable<UserAPIResult> {
    const uri = `users/${userId}`;
    return this.apiService.callApi('PUT', uri, { data: payload})
      .do((result: UserAPIResult) => {
        if (result.success) {
          this.loginService.setUserData(result.data);
        }
        this.toastrService.show(null, result);
      })
      .share();
  }

  public updateUserPassword(userId: string, payload: UserPasswordUpdatePayload): Observable<UserAPIResult> {
    const uri = `users/${userId}/ops/changepwd`;
    return this.apiService.callApi('POST', uri, { data: payload })
      .do((result: UserAPIResult) => {
        this.toastrService.show(null, result);
      })
      .share();
  }
}

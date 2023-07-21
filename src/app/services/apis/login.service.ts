import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as sha256 from 'crypto-js/sha256';
import { ApiService, APIResult } from './api.service';
import { PrivilegesService } from '../privileges.service';
import { GlobalStorageService } from '../global-storage.service';
import { environment } from '../../../environments/environment';
import USER_ROLE from 'app/config/user.roles';

export const LOGIN_TOKEN = 'login_token';
export const ORG_OID = 'org_oid';
export const PRIVILEGE_LIST = 'privilege_list';
export const ROLES = 'roles';
export const LOGIN_DATA = 'login_data';

export interface LoginData {
  passExpired: boolean;
  orgName: string;
  userOid: string;
  orgOid: string;
  enableUtilityCheck: boolean;
  orgUrl: string;
  userName: string;
  login: string;
  userId: string;
  orgId: string;
  rootURL: string;
  userPrefList: string;
  enableCMCheck: boolean;
  privList: string;
  trialExpDate: number;
  forceChangePass: boolean;
  'itscape-api-key': string;
  sessionTTL: number;
  adminURL: string;
  lang: string;
  email: string;
}

export interface UserData {
  login: string;
  email: string;
  orgId: string;
  orgName: string;
  orgOid: string;
  userId: string;
  userName: string;
  userOid: string;
  userPrefList: string;
}

const ORGANIZATION = 'organization';
const USERNAME = 'username';

@Injectable()
export class LoginService {
  constructor(
    private titleService: Title,
    private apiService: ApiService,
    private privilegesService: PrivilegesService,
    private storage: GlobalStorageService
  ) {}

  public login(org: string, user: string, pass: string): Observable<APIResult<LoginData>> {
    const uri = 'session?getPrivileges=true';
    const obj = { orgName: org, login: user, password: '*****', a2: sha256(pass) };
    const requestOptions = { contentType: 'application/x-www-form-urlencoded' };

    this.storage.removeLocal(PRIVILEGE_LIST);
    this.storage.removeLocal(ROLES);

    return this.apiService.callApi('POST', uri, obj, requestOptions, true)
      .catch((err) => {
        return Observable.of({ success: false, msg: err.message, data: null });
      })
      .do((result: APIResult<LoginData>) => {
        if (!result) return;

        const { data, success } = result;
        if (!success) return;

        const userRole = this.getUserRole(data.orgId);

        this.apiService.token = data['itscape-api-key'];
        this.apiService.org = data['orgOid'];
        this.privilegesService.setPrivileges(data['privList']);
        this.storage.storeLocal(LOGIN_TOKEN, data['itscape-api-key']);
        this.storage.storeLocal(ORG_OID, data['orgOid']);
        this.storage.storeLocal(PRIVILEGE_LIST, data['privList']);
        this.storage.storeLocal(LOGIN_DATA, JSON.stringify(data));
        this.storage.storeLocal(ROLES, userRole);

        try {
          window['intercomSettings'] = { app_id: 'ph5yu7iz', tenantName: data['orgName'], userName: data['login'] };

          const s = document.createElement('script');

          s.type = 'text/javascript';
          s.async = true;
          s.src = 'https://widget.intercom.io/widget/ph5yu7iz';

          const x = document.getElementsByTagName('script')[0];

          x.parentNode.insertBefore(s, x);
        } catch (Error) {
          throw Error;
        }
      });
  }

  public logout() {
    const uri = 'session';
    const requestOptions = {
      contentType: '*/*'
    };
    const defer = this.apiService.callApi('DELETE', uri, undefined, requestOptions);

    defer.subscribe(
      result => {
        this.apiService.token = '';
        this.apiService.org = '';
        this.storage.removeLocal(LOGIN_TOKEN);
        this.storage.removeLocal(ORG_OID);
        this.storage.removeLocal(PRIVILEGE_LIST);
        this.storage.removeLocal(LOGIN_DATA);
      },
      error => {
        console.log('error', error);
      }
    );

    return defer;
  }

  public getDevParamOptions() {
    const searchParams = new HttpParams({ fromString: window.location.search.slice(1) });

    return {
      animation : searchParams.get('animation') !== 'false'
    };
  }

  public getSubdomain() {
    const hostParts = window.location.host.split(/\./);
    const subdomain = hostParts.length > 2 ? hostParts[0] : null;
    // Need to remove this in release
    if (subdomain === 'cloud' || subdomain === 'cloudqa') {
      return 'iqcloud';
    }

    return subdomain;
  }

  public storeOrgAndUsername(organization, username) {
    this.storage.storeLocal(ORGANIZATION, organization);
    this.storage.storeLocal(USERNAME, username);
  }

  public clearOrgAndUsername() {
    this.storage.removeLocal(ORGANIZATION);
    this.storage.removeLocal(USERNAME);
  }

  public getOrgAndUsername() {
    const organization = this.storage.getLocal(ORGANIZATION);
    const username = this.storage.getLocal(USERNAME);

    return {
      organization,
      username
    };
  }

  public getUserData(): UserData {
    const loginData = this.storage.getLocal(LOGIN_DATA);
    const {
      login,
      email,
      orgId,
      orgName,
      orgOid,
      userId,
      userName,
      userOid,
      userPrefList
    } = loginData;

    return {
      login,
      email,
      orgId,
      orgName,
      orgOid,
      userId,
      userName,
      userOid,
      userPrefList
    };
  }

  public setUserData(payload): void {
    let loginData = this.storage.getLocal(LOGIN_DATA);

    loginData = {
      ...loginData,
      userPrefList : payload.preferences,
      email        : payload.email,
      userName     : payload.name
    };

    this.titleService.setTitle(`${loginData.orgName} - ${loginData.userName}`);
    this.storage.storeLocal(LOGIN_DATA, JSON.stringify(loginData));
  }

  private getUserRole (orgId: string): string {
    const MAP = {
      'Organization' : USER_ROLE.CUSTOMER,
      'SolProvider'  : USER_ROLE.SYSTEM_PROVIDER,
      'SvcProvider'  : USER_ROLE.SERVICE_PROVIDER
    };

    const [, tenantType] = orgId.split(':');

    return MAP[tenantType];
  }
}

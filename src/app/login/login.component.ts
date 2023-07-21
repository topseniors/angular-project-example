import { Component, OnInit } from '@angular/core';
import { APIResult } from '../services/apis/api.service';
import { LoginService, LoginData } from '../services/apis/login.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector    : 'app-login',
  templateUrl : './login.component.html',
  styleUrls   : ['./login.component.less']
})

export class LoginComponent implements OnInit {
  organization: string;
  username: string;
  password: string;
  checked: boolean;

  private processingLogin: boolean;
  private showError: boolean;
  private showOrg: boolean;
  private animation: boolean;
  private sub;
  private error;

  constructor (
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit () {
    const { organization, username } = this.loginService.getOrgAndUsername();
    const devParams = this.loginService.getDevParamOptions();
    const subdomain = this.loginService.getSubdomain();

    this.showOrg = true;
    this.checked = false;
    this.sub = this.route.queryParams.subscribe(params => {
      if (params.sessionExpired) {
        this.showError = true;
        this.error     = 'SESSION_EXPIRED';
      }
    });


    //TODO: beta - environment- enable organization
    this.showOrg = true;

    // if (subdomain) {
    //   this.organization = subdomain;
    //   this.showOrg = false;
    // }



    if (organization && username) {
      this.organization = organization;
      this.username     = username;
      this.checked      = true;
    }

    this.animation = (devParams.animation === undefined) || !!devParams.animation;

    if (window['__interval__']) {
      // For some weird reason first call to cancel the request animation
      // frame does not actually cancel it, need to call it twice
      window['splashScreen'].cancelAnimationFrame(window['__interval__']);

      setTimeout(() => {
        window['splashScreen'].cancelAnimationFrame(window['__interval__']);
      }, 100);
    }
  }

  onLogin (form) {
    const { value: { checked, organization = this.organization, password, username } } = form;

    this.processingLogin = true;
    this.showError = false;

    this.loginService.login(organization, username, password)
      .subscribe((result: APIResult<LoginData>) => {
        if (!result) return;

        const { data, msg, success } = result;
        this.processingLogin = false;

        if (success) {
          if (checked) {
            this.loginService.storeOrgAndUsername(organization, username);
          } else {
            this.loginService.clearOrgAndUsername();
          }

          this.router.navigate(['/main', 'dashboard']);
        } else {
          this.showError = true;
          this.error = 'INVALID_CREDENTIALS';
        }
      });
  }
}

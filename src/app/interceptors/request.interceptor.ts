import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import * as urlParse from 'url-parse';
import { AuthService } from '../services/auth.service';
import { MatSnackBarInjectedData } from '../components/notification/notification.component';
import { ToastrService } from '../services/toastr.service';
import { ErrorService } from '../services/error.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastrService: ToastrService,
    private errorService: ErrorService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next
      .handle(this.upgradeRequest(req))
      .catch((event) => {
        if (event instanceof HttpErrorResponse) {
          return this.handleError(event);
        }

        return Observable.throw(event);
      });
  }

  private upgradeRequest(req: HttpRequest<any>): HttpRequest<any> {
    const headers = req.headers
      .set('Accept', 'application/json')
      .set('itscape-api-key', this.authService.getToken());

    return req.clone({ headers });
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    const { url, message } = error;
    let { status } = error;
    const detailedErrorMessage = error.error;
    let subTitle;

    this.errorService.add({ url, status });

    if (status === 401) {
      // First, remove all the auth data stored in local storage/cookies
      this.authService.cleanup();

      if (window.location.pathname.indexOf('/login') < 0) {
        // Redirect user to login page
        window.location.href = '/login?sessionExpired=true';
        return Observable.empty();
      }
      return Observable.throw(error);
    }

    const parsedUrl = new urlParse(url);
    if (parsedUrl.pathname === '/sync/test') {
      return Observable.throw(error);
    }

    if (parsedUrl.pathname === '/ci-search' && status === 400) {
      status = null;
      subTitle = 'SEARCH.DO_SEARCH.SEARCH_STRING_BAD_FORMAT';
    } else {
      subTitle = (detailedErrorMessage) ? JSON.stringify(detailedErrorMessage) : message;
    }
    const injectedData: MatSnackBarInjectedData = {
      httpError: true,
      status,
      title: 'GENERAL.HTTP_ERROR_TITLE',
      subTitle
    };

    this.toastrService.show(injectedData, null);

    return Observable.throw(error);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class SummaryService {
  constructor(private apiService: ApiService) { }

  public getAppSummary() {
    let params = {
      page: 1,
      limit: 25
    }
    let uri = 'portlet/appsummary';
    return this.apiService.callApi('GET', uri, params);
  }

  public getAppOverview() {
    let params = {
      changes: 'today'
    }
    let uri = 'portlet/appoverview';
    return this.apiService.callApi('GET', uri, params);
  }

  public getServerSummary() {
    let params = {
      page: 1,
      limit: 25
    }
    let uri = 'portlet/serversummary';
    return this.apiService.callApi('GET', uri, params);
  }

  public getCSUtilize(date: string) {
    let params = {
      start: date,
      view: 's'
    }
    let uri = 'portlet/csutilize';
    return this.apiService.callApi('GET', uri, params);
  }

  public getCSD() {
    let params = {
      page: 1,
      start: 0,
      limit: 25,
      sort: [{"property":"app","direction":"DESC"}]
    }
    let uri = 'portlet/csd';
    return this.apiService.callApi('GET', uri, params);
  }


}

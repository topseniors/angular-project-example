import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ApiService, StringableCollection } from './api.service';
import { GlobalStorageService } from '../global-storage.service';
import { ORG_OID } from './login.service';

export interface ITUAPIResult<T> {
  searches: T[];
}

@Injectable()
export class ITUService {

  constructor(private apiService: ApiService,
              private storage: GlobalStorageService) { }

  public getSavedSearches(entityType?: string): Observable<ITUAPIResult<SavedSearch>> {
    const entityTypeVal = (entityType) ? entityType : 'All';
    const uri = `itu/searches/${entityTypeVal}`;

    return this.apiService.callApi('GET', uri, null).share();

    //const uri = `itu/searches/All`;

    //return this.apiService.callApi('GET', uri, null).map((result) => {
    //  result.searches = result.searches.filter((iterator) => (entityTypeVal === 'All' || iterator.entity === entityTypeVal));
    //  return result;
    //}).share();
  }

  public getTree() {
    let params = {
      node: 'root',
      id: 'root'
    }

    let uri = 'itu/tree';
    return this.apiService.callApi('GET', uri, params);
  }

  public getList(server: string, id: string) {
    let params = {
      server: server,
      id: this.storage.getLocal(ORG_OID) + ":Search:" + id,
      page: 1,
      start: 0,
      limit: 50
    }

    let uri = 'itu/list';
    return this.apiService.callApi('GET', uri, params);
  }

  public getDetails(type: string, id: string, page: string = '') {
    let params = {
      type: type,
      page: page,
      id: this.storage.getLocal(ORG_OID) + ':' + type + ':' + id
    }

    let uri = 'itu/details';
    return this.apiService.callApi('GET', uri, params);
  }

  public getCrumb(type: string, id: string) {
    let uri = 'itu/' + this.storage.getLocal(ORG_OID) + ':' + type + ':' + id + '/crumb';
    return this.apiService.callApi('GET', uri);
  }
}

export type SavedSearch = {
  className?: string,
  oid: string,
  entity?: string,
  q?: string,
  fqs: string,
  name?: string,
  shortDescr: string
};

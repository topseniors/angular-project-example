import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { ApiService } from './api.service';
import { GlobalStorageService } from '../global-storage.service';
import Utils from '../../utils';
import { ORG_OID } from './login.service';

@Injectable()
export class ITExplorerService {

  constructor(private apiService: ApiService,
              private storage: GlobalStorageService) { }

  public getApplication(applicationId: string): Observable<Application> {
    const uri = 'applications/' + this.storage.getLocal(ORG_OID) + ':Application:' + applicationId;
    return this.apiService.callApi('GET', uri)
      .map(result => result.data)
      .map(Coercer.application).share();
  }

  public getApplications(): Observable<Application[]> {
    const params = {
      $format:"grid",
      $select:"",
      getRefs: true,
      page: 1,
      start: 0,
      limit: 25,
      sort: [{"property":"name","direction":"ASC"}]
    };

    const uri = 'applications';
    return this.apiService.callApi('GET', uri, params)
      .map(result => result.data)
      .map(c => c.map(Coercer.application)).share();
  }
}

/** RAW TYPES SECTION */

type RawApplicationCommon = {
  name: string;
  id: string;
};

type RawApplication = RawApplicationCommon & {

};

/** COERCED TYPES SECTION */

export type ResultData = {
  total: number,
  current: number
};

type ApplicationCommon = {
  resultData: ResultData;
  name: string;
  id: string;
};

export type Application = ApplicationCommon & {

};

/** DATA COERCER SECTION */

class Coercer {
  private static resultData(resultData: string): ResultData {
    return (resultData==="")? undefined : JSON.parse(resultData);
  }

  public static application(raw: RawApplication): Application {
    return <Application>_.mapValues(raw, (v,k) => {
      if (typeof v === 'string') v = v.trim();
      switch (k) {
        case 'resultData':
          return Coercer.resultData(<string>v);
        default:
          return v;
      }
    });
  }
}

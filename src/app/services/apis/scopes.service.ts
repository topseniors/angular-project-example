import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { ApiService, APIResult } from './api.service';
import { ToastrService } from 'app/services/toastr.service';

export type ScopesAPIResult<T> = APIResult<T>;

export interface RemoveFromScopePayload {
  data: {
    list: string;
  };
}

@Injectable()
export class ScopesService {

  constructor(private apiService: ApiService, private toastrService: ToastrService) { }

  public getScopes(): Observable<ScopesAPIResult<Scope>> {
    const uri = `scopes`;
    return this.apiService.callApi('GET', uri)
      .do(result => result.data = result.data.map(Coercer.scope))
      .share();
  }

  public getScanJobScopes(scanJobId: string): Observable<ScopesAPIResult<Scope>> {
    const uri = `scanjobs/${scanJobId}/scopes`;
    return this.apiService.callApi('GET', uri)
      .do(result => result.data = result.data.map(Coercer.scope))
      .share();
  }

  public removeFromScope(scopeId: string, payload: RemoveFromScopePayload): Observable<ScopesAPIResult<Scope>> {
    const uri = `scopes/${scopeId}/ops/removeFromScope`;

    return this.apiService.callApi('POST', uri, payload)
      .do(result => this.toastrService.show(null, result))
      .share();
  }
}

/** RAW TYPES SECTION */

interface RawScope {
  orgOid: string;
  orgId: string;
  oid: string;
  id: string;
  className: 'Scope';
  confErrorReason: string;
  confState: string;
  type: string;
  creationDate: number;
  modificationDate: number;
  name: string;
  shortDescr: string;
}

/** COERCED TYPES SECTION */

export type ApScoutId = [string, string, string];

export interface Scope {
  orgOid: string;
  orgId: ApScoutId;
  oid: string;
  id: string;
  className: 'Scope';
  name: string;
  shortDescr: string;
}

/** DATA COERCER SECTION */
class Coercer {
  private static apScoutId(apScoutId: string): ApScoutId {
    return (apScoutId === '') ? undefined : <ApScoutId>apScoutId.split(':');
  }

  public static scope(raw: RawScope): any {
    const pickedRaw = _.pick(raw, ['orgOid', 'orgId', 'oid', 'id', 'className', 'name', 'shortDescr']);

    return _.mapValues(pickedRaw, (v, k) => {
      if (typeof v === 'string') {
        v = v.trim();
      }

      switch (k) {
        case 'orgId':
          return Coercer.apScoutId(<string>v);
        default:
          return v;
      }
    });
  }
}

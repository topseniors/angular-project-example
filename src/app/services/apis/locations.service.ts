import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import Utils from '../../utils';
import * as _ from "lodash";

@Injectable()
export class LocationsService {

  private locations$ = new ReplaySubject<Location[]>(1);

  constructor(private apiService: ApiService) {
    let _sub = this.fetchLocations().delay(0).subscribe(locations => {
      _sub.unsubscribe();
      this.locations$.next(locations);
    });
  }

  private fetchLocations(): Observable<Location[]> {
    let uri = 'locations';
    return this.apiService.callApi('GET', uri)
    .map(result => result.data)
    .map(c => c.map(Coercer.location)).share();
  }

  public getLocations(): Observable<Location[]> {
    return this.locations$;
  }

  public getLocation(locationId:string): Observable<Location> {
    return this.locations$.map(locations => {
      return _.find(locations, location => location.id.join(':') === locationId);
    }).share();
  }
}

export type ApScoutId = [string, string, string];

export type RawLocation = {
  "modificationDate": number,
  "orgOid": string,
  "shortDescr": string,
  "name": string,
  "className": "Location",
  "id": string, // "opscope:Location:default",
  "oid": string,
  "creationDate": number,
  "orgId": string // "itssvc:Organization:opscope"
}

export type Location = {
  "modificationDate": number,
  "orgOid": string,
  "shortDescr": string,
  "name": string,
  "className": "Location",
  "id": ApScoutId, // "opscope:Location:default",
  "oid": string,
  "creationDate": number,
  "orgId": ApScoutId // "itssvc:Organization:opscope"
}

class Coercer {
  private static apScoutId(apScoutId: string): ApScoutId {
    return (apScoutId==="")? undefined : <ApScoutId>apScoutId.split(':');
  }
  public static location(raw: RawLocation): Location {
    return <Location>_.mapValues(raw, (v,k) => {
      if (typeof v === 'string') v = v.trim(); // because who needs whitespaces...
      switch (k) {
        case 'orgId':
        case 'id':
          return Coercer.apScoutId(<string>v);
        case 'modificationDate':
        case 'orgOid':
        case 'shortDescr':
        case 'name':
        case 'className':
        case 'oid':
        case 'creationDate':
        default:
          return v;
      }
    });
  }
}

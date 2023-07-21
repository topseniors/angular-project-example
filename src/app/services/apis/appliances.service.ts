import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import Utils from '../../utils';
import * as _ from "lodash";

@Injectable()
export class AppliancesService {

  private appliances$ = new ReplaySubject<Appliance[]>(1);

  constructor(private apiService: ApiService) {
    let _sub = this.fetchAppliances().delay(0).subscribe(appliances => {
      _sub.unsubscribe();
      this.appliances$.next(appliances);
    });
  }

  private fetchAppliances(): Observable<Appliance[]> {
    let uri = 'appliances';
    return this.apiService.callApi('GET', uri)
    .map(result => result.data)
    .map(c => c.map(Coercer.appliance)).share();
  }

  private fetchAppliance(applianceId:string): Observable<Appliance> {
    let uri = 'appliances/' + applianceId;
    return this.apiService.callApi('GET', uri)
    .map(result => result.data)
    .map(Coercer.appliance).share();
  }

  public getAppliances(): Observable<Appliance[]> {
    return this.appliances$;
  }

  public getAppliance(applianceId:string): Observable<Appliance> {
    return this.appliances$.map(appliances => {
      return _.find(appliances, appliance => appliance.id.join(':') === applianceId);
    }).share();
  }
}

export type RawAppliance = {
  "catalogVersion": string,
  "lastStatusDate": string,
  "role": string,
  "orgOid": string,
  "timeZone": string,
  "className": "Appliance",
  "applianceVersion": string,
  "oid": string,
  "creationDate": number,
  "orgId": string,
  "catalogStatus": string,
  "modificationDate": number,
  "deploymentType": string,
  "machineSignature": string,
  "name": string,
  "id": string,
  "IPAddress": string,
  "catalogVersionDate": string
}

export type ApScoutId = [string, string, string];

export type Appliance = {
  "catalogVersion": CatalogVersion[],
  "lastStatusDate": number,
  "role": number,
  "orgOid": string,
  "timeZone": string, // "Europe/Dublin"
  "className": "Appliance",
  "applianceVersion": string, // "3.1.11"
  "oid": string,
  "creationDate": number,
  "orgId": ApScoutId, // "itssvc:Organization:iqcloud"
  "catalogStatus": string, // "KO"
  "modificationDate": number,
  "deploymentType": string, // "Standard"
  "machineSignature": string, // "null"
  "name": string, // "demo_OS64bits"
  "id": ApScoutId, // "iqcloud:Appliance:demo_OS64bits"
  "IPAddress": string, // "null"
  "catalogVersionDate": number
}

export type CatalogVersion = {
  "ownerOrgId": ApScoutId, // "SYS:SolProvider:sys"
  "versionByEntity": number,
  "version": number,
  "entity": string // "ScanExtension"
};

class Coercer {
  private static catalogVersion(catalogVersion: string): CatalogVersion[] {
    let jsonArray = [];
    try { jsonArray = JSON.parse(catalogVersion); }
    catch(e) { console.warn('Badly formatted JSON: ', catalogVersion); }
    return jsonArray.map(d => <CatalogVersion>_.mapValues(d, (v,k) => {
      if (typeof v === 'string') v = v.trim(); // because who needs whitespaces...
      switch (k) {
        case 'ownerOrgId':
          return Coercer.apScoutId(<string>v);
        case 'versionByEntity':
        case 'version':
        case 'entity':
        default:
          return v;
      }
    }));
  }
  private static apScoutId(apScoutId: string): ApScoutId {
    return (apScoutId==="")? undefined : <ApScoutId>apScoutId.split(':');
  }
  public static appliance(raw: RawAppliance): Appliance {
    return <Appliance>_.mapValues(raw, (v,k) => {
      if (typeof v === 'string') v = v.trim(); // because who needs whitespaces...
      switch (k) {
        case 'catalogVersion':
          return Coercer.catalogVersion(<string>v);
        case 'lastStatusDate':
        case 'role':
        case 'catalogVersionDate':
        return Utils.string2number(<string>v);
        case 'orgId':
        case 'id':
          return Coercer.apScoutId(<string>v);
        case 'className':
        case 'applianceVersion':
        case 'oid':
        case 'creationDate':
        case 'catalogStatus':
        case 'modificationDate':
        case 'deploymentType':
        case 'machineSignature':
        case 'name':
        case 'orgOid':
        case 'IPAddress':
        default:
          return v;
      }
    });
  }
}

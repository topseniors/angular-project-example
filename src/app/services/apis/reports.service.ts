import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { FactoryUtilsService } from '../factory-utils.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ReportsService {
  constructor(private apiService: ApiService, private factoryUtils: FactoryUtilsService) { }

  public mockedReportsSummary(){
    let mockData = {
      items: 7,
      data: [
        { title: "Scanned devices", value: 15464 },
        { title: "Missing devices", value: 1238 },
        { title: "Cross reference reports", value: 1165 },
        { title: "Points to watch", value: 1165 },
        { title: "Collection issues", value: 14 },
        { title: "Data integrity", value: 1238 },
        { title: "Cloud dependencies", value: 1238 }
      ]
    };
    return Observable.of(mockData).share();
  }

  public getScannedDevices(){
    let params = {
      $select: "id,csId,IPAddress,hostName,guessedOS,OSModel,OSVersion,modificationDate",
      _dc: Date.now(), // ?? WARN not sure
      page: 1,
      $skip: 0,
      $top: 50
    }

    let uri = 'unqualifiedcs';
    return this.apiService.callApi('GET', uri, params);
  }

  public mockScannedDevices(nrows:number=150){
    let datumFactory = () => {
      return {
        "hostName": this.factoryUtils.getRandomName(this.factoryUtils.getRandomInt(2,3)),
        "IPAddress": this.factoryUtils.getRandomIp(),
        "OSModel": this.factoryUtils.getRandomName(),
        "OSVersion": this.factoryUtils.getRandomInt()+'.'+this.factoryUtils.getRandomInt(),
        "modificationDate": this.factoryUtils.getRandomInt(1478613038164,1507217049359)
      }
    }
    let mockData: any[] = [];
    for (let i=0, nrows=this.factoryUtils.getRandomInt(60,140); i<nrows; i++) mockData.push(datumFactory());
    return Observable.of({data:mockData}).share();
  }

  public getMissingDevices(){
    let uri = "discovery/missingip/report";
    let params = {
      _dc: Date.now(),
      page:1,
      start:0,
      limit:50
    };
    return this.apiService.callApi('GET', uri, params)
    .map(payload=>{
      if (payload.success) return payload.data;
      else throw new Error(payload.message);
    });
  }

  public mockMissingDevices(nrows:number=150){
    let datumFactory = () => {
      return {
        "csId": this.factoryUtils.getRandomName(this.factoryUtils.getRandomInt(2,3)),
        "shortDescr": this.factoryUtils.getRandomIp(),
        "nbno": this.factoryUtils.getRandomInt()+'',
        "cxno": this.factoryUtils.getRandomInt()+'',
        "leaf": this.factoryUtils.getRandomInt(0,1)?"true":"false",
        "cxMap": [
          {
            "summary": this.factoryUtils.getRandomName(this.factoryUtils.getRandomInt(2,3)),
            "NoSw": this.factoryUtils.getRandomInt(),
            "NoPs": this.factoryUtils.getRandomInt(),
            "hostName": this.factoryUtils.getRandomName(),
            "nbMissing": this.factoryUtils.getRandomInt(),
            "ip": this.factoryUtils.getRandomIp(),
            "type": this.factoryUtils.getRandomName(),
            "nbTotal": this.factoryUtils.getRandomInt(),
            "NoIP": this.factoryUtils.getRandomInt(),
            "cxTotal": this.factoryUtils.getRandomInt(5,20),
            "nbResolved": this.factoryUtils.getRandomInt(),
            "NoCX": this.factoryUtils.getRandomInt(),
            "shortDescr": this.factoryUtils.getRandomName(),
            "id": this.factoryUtils.getRandomName(3),
            "OK": this.factoryUtils.getRandomInt(1,100),
            "status": 0
          }
        ], ...this.factoryUtils.maybe({"dns": this.factoryUtils.getRandomName(3)})||{}
      }
    }

    let mockData: any[] = [];
    for (let i=0, nrows=this.factoryUtils.getRandomInt(60,140); i<nrows; i++) mockData.push(datumFactory());
    return Observable.of(mockData).share();
  }
}

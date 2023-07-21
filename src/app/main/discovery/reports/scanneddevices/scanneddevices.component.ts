import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { ReportsService } from '../../../../services/apis/reports.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import { TableActionsButtonComponent, ActionButton } from '../../../../components/table-actions-button/table-actions-button.component';

@Component({
  selector: 'app-discovery-reports-scanneddevices',
  templateUrl: './scanneddevices.component.html',
  styleUrls: ['./scanneddevices.component.less']
})
export class DiscoveryReportsScanneddevicesComponent implements OnInit {

  listSettings = {};
  scannedDevices = [];
  subTitleInfo = new BehaviorSubject<string>("");
  private menuActions = ["ADDTOSCOPE", "REMOVEFROMSCOPE", "CREATENEWSCOPE", "RESETITEM", "SERVERDETAILS"];
  private menuItemsTitles;

  constructor(private reportsService: ReportsService, private translate: TranslateService) { }

  ngOnInit() {
    // async step to ensure translation file is loaded
    this.translate.get('DISCOVERY.REPORTS.SCANNEDDEVICES').subscribe(() => {
      this.initColumnHeaders();
      this.initActionMenu();
    })
  }

  private initActionMenu(){
    this.menuItemsTitles = this.menuActions.map((action) => {
      return this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.ACTIONMENU.'+action);
    });
  }

  private initColumnHeaders() {
    this.listSettings = {
      columns: {
        IPAddress: { title: this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.IPADDRESS') },
        hostName: { title: this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.HOSTNAME') },
        OSModel: { title: this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.OSMODEL') },
        OSVersion: { title: this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.OSVERSION') },
        lastUpdated: { title: this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.LASTUPDATED') },
        button: {
          type: 'custom',
          renderComponent: TableActionsButtonComponent,
          onComponentInitFunction: (instance: {menuItems: ActionButton<any>[]}) => {
            instance.menuItems = this.menuItemsTitles.map(title => {
              let events = new Subject<any>();
              events.subscribe((rowData:any)=>{
                // todo context menu callback
              })
              return { title, events };
            });
          }
        }
      },
      actions: undefined,
      hideSubHeader: true,
      pager: {
        perPage: 10
      }
    };

    this.reportsService.mockScannedDevices().subscribe((result:any) => {
      result.data.forEach(device => {
        let date1 = moment();
        let date2 = moment(parseInt(device.modificationDate));
        let dateTrans = {days: moment.duration({ days: date1.diff(date2, 'days')}).humanize(), time: date2.format("HH:mm")};
        device.lastUpdated = this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.LASTUPDATED_DATE', dateTrans);
      })
      this.scannedDevices = result.data;
      this.subTitleInfo.next(result.data.length + " " + this.translate.instant('DISCOVERY.REPORTS.SCANNEDDEVICES.SUBTITLE'));
      this.subTitleInfo.complete();
    });
  }

}

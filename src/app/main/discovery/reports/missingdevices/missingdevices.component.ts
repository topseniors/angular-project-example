import { Component, ViewChild, OnInit, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatPaginator, MatInput } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReportsService } from '../../../../services/apis/reports.service';
import { TranslateService } from '@ngx-translate/core';
import { SuperTableComponent, ColumnDefinition } from '../../../../components/super-table/super-table.component';
import { ActionButton } from '../../../../components/table-actions-button/table-actions-button.component';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/observable/forkJoin';
import * as _ from 'lodash';

export interface MissingDeviceData {
  ip: string;
  dns: string;
  foundneighbours: number;
  connections: number;
}

function inputMapper(d: any): MissingDeviceData {
  return {
    ip: d.shortDescr,
    dns: d.dns,
    foundneighbours: d.nbno,
    connections: d.cxno
  };
}

@Component({
  selector: 'app-discovery-reports-missingdevices',
  entryComponents: [],
  templateUrl: './missingdevices.component.html',
  styleUrls: ['./missingdevices.component.less']
})
export class DiscoveryReportsMissingdevicesComponent implements OnInit {
  private subTitleInfo: Observable<string>;
  private errorMessage: string;
  private actions: ActionButton<MissingDeviceData>[];

  private displayedColumns = ['ip', 'dns', 'foundneighbours', 'connections'];
  private static readonly menuActions = ['ADDTOSCOPE', 'REMOVEFROMSCOPE', 'CREATENEWSCOPE', 'RESETITEM', 'SERVERDETAILS'];

  private data: Observable<MissingDeviceData[]>;
  private columns;

  constructor(private reportsService: ReportsService, private translate: TranslateService, private resolver: ComponentFactoryResolver) { }

  @ViewChild(SuperTableComponent) table: SuperTableComponent<MissingDeviceData>;

  ngOnInit() {

    // let factory: ComponentFactory<DummyCell> = this.resolver.resolveComponentFactory(DummyCell);

    this.columns = [
      { def: 'ip', header: 'IP ADDRESS', cell: 'yolo'},
      { def: 'dns', cell: (row: MissingDeviceData) => { return row.dns; } },
      { def: 'foundneighbours', sort: true },
      {
        def: 'connections',
        cell: ''
        // cell: {factory} as CustomComponent<MissingDeviceData, DummyCell>
      }
    ];

    this.data = this.reportsService.mockMissingDevices().catch((err)=>{
      this.errorMessage = err.message;
      return Observable.of([]).share();
    }).map(d => d.map(inputMapper));

    const translation = this.translate.get('DISCOVERY.REPORTS.MISSINGDEVICES.SUBTITLE');
    translation.subscribe(()=>{ this.actions = this.makeMenu(); })
    const initFetch = Observable.forkJoin(this.data, translation).share();

    this.subTitleInfo = initFetch.map(([data, subtitle]) => {
      return data.length + ' ' + subtitle;
    });
  }

  private makeMenu(): any {
    return DiscoveryReportsMissingdevicesComponent.menuActions.map((action: string) => {
      return [action, this.translate.instant('DISCOVERY.REPORTS.MISSINGDEVICES.ACTIONMENU.' + action)];
    }).map(([key, title]) => {
      let events = new Subject<MissingDeviceData>();

      events.subscribe((rowData:MissingDeviceData) => {
        // todo context menu callback
      });

      return {
        key,
        title,
        events
      };
    });
  }

  private inputMapper(d: any): MissingDeviceData {
    return {
      ip: d.shortDescr,
      dns: d.dns,
      foundneighbours: d.nbno,
      connections: d.cxno
    };
  }
}

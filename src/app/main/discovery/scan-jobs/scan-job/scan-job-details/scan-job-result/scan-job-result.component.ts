import {
  Component,
  ComponentFactoryResolver,
  Input,
  ViewChild
} from '@angular/core';
import {
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import Utils from '../../../../../../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  DateTimeCell,
  DateTimeToken
} from 'app/components/date-time-cell/date-time-cell.component';

import {
  EffectIconComponent
} from 'app/components/effect-icon/effect-icon.component';

import {
  SuperTableComponent,
  RowTransform,
  ViewModel,
  RowDefinition,
  IconColumn,
  ColumnDefinition
} from 'app/components/super-table/super-table.component';

import {
  ScanJobsService,
  ScanJobRun,
  ScanJobsAPIResult,
  Transforms,
  IngestionMetricsSearchParams
} from 'app/services/apis/scanjobs.service';

import {
  Transforms as SearchTransforms
} from 'app/services/apis/search.service';

interface RowModel {
  changeType: string;
  changeSource: string;
  className: string;
  ip: string;
  name: string;
  time: number;
  oid: string;
}

@Component({
  selector: 'scan-job-result',
  templateUrl: './scan-job-result.component.html',
  styleUrls: ['./scan-job-result.component.less']
})
export class ScanJobResultComponent implements OnChanges, OnDestroy {
  private static readonly pollingInterval = 15000;
  private static readonly columnToFieldInfoMap = {
    name: { name: 'description', type: 'string' },
    time: { name: 'timestamp', type: 'number' },
    ip: { name: 'targetIP', type: 'string' }
  };

  @Input() scanJobRunId: string;
  @Input() closePopup: any;
  @ViewChild(SuperTableComponent) table: SuperTableComponent<any>;

  dataPopulated = false;
  totalRows = 0;
  polling$ = new Subject<ScanJobsAPIResult<RowModel>>();
  private apiSubscription: Subscription;

  rowDefs: RowDefinition<RowModel>[] = [{
    columns: ['entityType', 'name', 'ip', 'changeType', 'changeSource', 'time']
  }];

  columns: ColumnDefinition<RowModel, any, any>[] = [
    <IconColumn<RowModel>>
    {
      def: 'entityType',
      header: '',
      row2cell: (i, row) => ({
        extension: '.svg',
        icon: SearchTransforms.entityTypeIconTransform(i, row),
        title: ''
      }),
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      tooltip: (i, row) => row.className
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'name',
      header: 'Name',
      sort: true
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'ip',
      header: 'IP',
      sort: true
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'changeType',
      header: 'Change Type',
      sort: false
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'changeSource',
      header: 'Change Source',
      sort: false
    },

    <ColumnDefinition<RowModel, DateTimeToken, DateTimeCell>>
    {
      def: 'time',
      header: 'Time',
      row2cell: (i, row) => ({ started: row.time }),
      cell: this.resolver.resolveComponentFactory(DateTimeCell),
      sort: (cell) => cell.started,
      tooltip: (i, row) => {
        if (!row.time) return '';
        const tooltipStr = this.translate.instant('DISCOVERY.SCAN_JOBS.TIME') + ':\n' +
          this.datePipe.transform(row.time, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    }
  ];

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    const columns = ['entityType', 'name', 'ip', 'changeType', 'changeSource', 'time'];
    const fromViewModel = columns.reduce((agg, key) => {
      agg[key] = viewModel.cellMap[key];

      return agg;
    }, {});


    return JSON.stringify(fromViewModel);
  }

  constructor(
    private router: Router,
    private scanJobsService: ScanJobsService,
    private resolver: ComponentFactoryResolver,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService
  ) {
    this.refresh = this.refresh.bind(this);
    this.onRowClicked = this.onRowClicked.bind(this);
    this.rowDefs.forEach(rowDef => rowDef.onRowClicked = this.onRowClicked);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Force async to avoid making changes twice in the same digest cycle
    setTimeout(() => {
      if (changes['scanJobRunId'] && _.isUndefined(this.apiSubscription)) {
        this.refresh();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
  }

  public initializeTimeSort(): void {
    if (this.table.sort.active !== 'time') {
      this.table.sort.sort({ id: 'time', start: 'desc', disableClear: false });
    }
  }

  private getSearchParams(): IngestionMetricsSearchParams {
    if (!this.table) {
      return {
        start: 0,
        limit: 5
      };
    }

    const fieldInfo = ScanJobResultComponent.columnToFieldInfoMap[this.table.sort.active];
    const orderBy = fieldInfo && ('metricScanDetails.' + fieldInfo.name + ((fieldInfo.type === 'string') ? '.keyword' : ''));
    const orderDir = this.table.sort.direction || undefined;

    const from = this.table.paginator.pageSize * this.table.paginator.pageIndex;
    const pageSize = this.table.paginator.pageSize;

    return {
      from,
      orderBy,
      orderDir,
      pageSize
    };
  }

  private coercer = (result: any): ScanJobsAPIResult<RowModel> => {
    return {
      total: result.total,
      data: result.findings.map(this.mapper)
    };
  }

  private mapper = (d: any): RowModel => {
    const {
      changeType,
      systemType: className,
      systemId: oid,
      targetIP: ip,
      phaseName: changeSource,
      description: name,
      timestamp: time
    } = d;

    return {
      changeType: changeType || '-',
      className: className || '-',
      oid: oid || '-',
      ip: ip || '-',
      changeSource: changeSource || '-',
      name: name || '-',
      time: time || '-'
    };
  }

  private poll(): Observable<ScanJobsAPIResult<RowModel>> {
    const searchParams = this.getSearchParams();
    const current$ = this.scanJobsService.getScanJobRunResult(this.scanJobRunId, searchParams).map(this.coercer);
    const next$ = current$.delay(ScanJobResultComponent.pollingInterval).concatMap(() => this.poll());
    const interrupt$ = this.table.interrupt.concatMap(() => this.poll());

    return Observable.merge(current$, Observable.race(next$, interrupt$));
  }

  public refresh(): void {
    this.dataPopulated = false;
    this.totalRows = 0;
    this.apiSubscription = this.poll()
      .catch(() => {
        return Observable.of({ total: 0, data: [] });
      })
      .subscribe(result => {
        this.dataPopulated = true;
        this.totalRows = result.total || result.data.length;
        this.polling$.next(result);
      });
  }

  private onRowClicked(rowIndex: number, row: RowModel, $event): void {
    if (_.includes(['new', 'update'], _.toLower(row.changeType))) {
      const params = {
        className: row.className,
        oid: row.oid
      };

      this.closePopup();
      this.router.navigate([`/main/it-explorer`, params]);
    }
  }
}

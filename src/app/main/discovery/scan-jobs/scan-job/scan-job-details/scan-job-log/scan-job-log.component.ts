import {
  Component, Input, ComponentFactoryResolver, EventEmitter,
  ContentChildren, ViewChild, ViewChildren, ContentChild, QueryList
} from '@angular/core';
import {
  OnChanges, AfterContentInit,
  SimpleChanges, OnDestroy
} from '@angular/core/src/metadata/lifecycle_hooks';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {
  SuperTableComponent,
  RowTransform,
  ViewModel,
  RowDefinition,
  ColumnDefinition
} from '../../../../../../components/super-table/super-table.component';
import {
  ScanJobsService, ScanJobRun, ScanJobsAPIResult,
  Transforms, IngestionMetricsSearchParams, RescanPayload, ScanJob
} from '../../../../../../services/apis/scanjobs.service';
import { ScopesService, Scope, RemoveFromScopePayload, ScopesAPIResult } from '../../../../../../services/apis/scopes.service';
import { DateTimeCell, DateTimeToken } from '../../../../../../components/date-time-cell/date-time-cell.component';
import Utils from '../../../../../../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

interface ScanJobRunLog {
  time: number; ip: string; status: string; duration: number; info: string;
}

@Component({
  selector: 'scan-job-log',
  templateUrl: './scan-job-log.component.html',
  styleUrls: ['./scan-job-log.component.less']
})
export class ScanJobLogComponent implements OnChanges, OnDestroy {
  private static readonly pollingInterval = 15000;
  private static readonly columnToFieldInfoMap = {
    time: { name: 'startScanTimestamp', type: 'number' },
    ip: { name: 'targetIP', type: 'string' },
    status: { name: 'scanStatus', type: 'string' },
    duration: { name: 'scanDuration', type: 'number' },
    info: { name: 'additionalInfo', type: 'string' }
  };

  @Input() scanJobId: string;
  @Input() scanJobRunId: string;
  @ViewChild(SuperTableComponent) table: SuperTableComponent<any>;
  @ContentChildren('/deep/mat-checkbox', { descendants: true }) checkboxes: QueryList<MatCheckbox>;

  private selectedScope = null;
  private scopes: Scope[] = [];
  private polling$ = new Subject<ScanJobsAPIResult<ScanJobRunLog>>();
  private byInterrupt = false;

  private _scanJobLogsSub: Subscription;
  private _scopesSub: Subscription;
  private _tickAllHeaderSub: Subscription;
  private _tickClearOperationAnyInterruptSub: Subscription;
  private _tickAllChangeSub: any = {};
  private _tickAnyCellSub: any = {};

  private clearSelection$ = new Subject<void>();
  private operationDone$ = new Subject<void>();
  private tickAll$ = new Subject<boolean>();
  private tickAny$ = new Subject<any>();

  private selectedScanLogs: string[] = [];

  dataPopulated = false;
  totalRows = 0;

  rowDefs: RowDefinition<ScanJobRunLog>[] = [{ columns: ['tickbox', 'time', 'ip', 'status', 'duration', 'info'] }];
  columns: ColumnDefinition<ScanJobRunLog, any, any>[] = [
    <ColumnDefinition<ScanJobRunLog, void>>
    {
      def: 'tickbox',
      header: this.resolver.resolveComponentFactory(MatCheckbox),
      headerContext: (cell: MatCheckbox) => {
        this._tickAllHeaderSub = cell.change.subscribe((event: MatCheckboxChange) => {
          this.tickAll$.next(event.checked);
        });
        setTimeout(() => {
          this._tickClearOperationAnyInterruptSub = Observable.merge(
            this.clearSelection$,
            this.operationDone$,
            this.tickAny$,
            this.table.interrupt
          ).subscribe(() => {
            cell.checked = false;
          });
        });
      },
      row2cell: (i, row) => ((cell: MatCheckbox) => {
        let subIterator: Subscription = this._tickAllChangeSub[`row${i}`];
        if (subIterator) {
          subIterator.unsubscribe();
        }
        this._tickAllChangeSub[`row${i}`] = this.tickAll$.subscribe((checked: boolean) => {
          if (cell.checked === checked) return;
          cell.checked = checked;
          this.processTickedScanLog(checked, row);
        });

        subIterator = this._tickAnyCellSub[`row${i}`];
        if (subIterator) {
          subIterator.unsubscribe();
        }
        this._tickAnyCellSub[`row${i}`] = cell.change.subscribe((event: MatCheckboxChange) => {
          this.tickAny$.next();
          this.processTickedScanLog(event.checked, row);
        });
      }),
      cell: this.resolver.resolveComponentFactory(MatCheckbox)
    },

    <ColumnDefinition<ScanJobRunLog, any>>
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
    },

    <ColumnDefinition<ScanJobRunLog, string>>
    {
      def: 'ip',
      header: 'IP',
      cssClass: (i, row) => Transforms.getColor(row.status),
      sort: true
    },

    <ColumnDefinition<ScanJobRunLog, string>>
    {
      def: 'status',
      header: 'Status',
      cssClass: (i, row) => Transforms.getColor(row.status),
      sort: true
    },

    <ColumnDefinition<ScanJobRunLog, string>>
    {
      def: 'duration',
      header: 'Duration',
      row2cell: (i, row) => {
        // see https://github.com/moment/moment/issues/348
        /* const duration = moment.duration(row['duration']);
        const uot = Object.keys((<any>duration)._data).reverse()
          .find(d => (<any>duration.get)(d));
        return (<any>duration.get)(uot) + ' ' + uot; */
        if (!row.duration) return '-';
        return moment.duration(row.duration).humanize();
      },
      cssClass: (i, row) => Transforms.getColor(row.status),
      sort: true
    },

    <ColumnDefinition<ScanJobRunLog, string>>
    {
      def: 'info',
      header: 'Scan Info',
      sort: true,
      tooltip: (i, row) => row.info
    }
  ];

  constructor(
    private scanJobsService: ScanJobsService,
    private scopesService: ScopesService,
    private resolver: ComponentFactoryResolver,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService
  ) {
    this.refresh = this.refresh.bind(this);
    this.coercer = this.coercer.bind(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Force async to avoid making changes twice in the same digest cycle
    setTimeout(() => {
      if (changes['scanJobRunId']) {
        this.initializeScanJobLogsSub();
      }
      if (changes['scanJobId']) {
        if (this._scopesSub) {
          this._scopesSub.unsubscribe();
        }
        this._scopesSub = this.getScanJobScopes().subscribe(result => {
          this.scopes = result;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this._scanJobLogsSub) {
      this._scanJobLogsSub.unsubscribe();
    }
    if (this._scopesSub) {
      this._scopesSub.unsubscribe();
    }
    if (this._tickAllHeaderSub) {
      this._tickAllHeaderSub.unsubscribe();
    }
    if (this._tickClearOperationAnyInterruptSub) {
      this._tickClearOperationAnyInterruptSub.unsubscribe();
    }

    _.forEach(this._tickAllChangeSub, (value, key) => this._tickAllChangeSub[key].unsubscribe());
    _.forEach(this._tickAnyCellSub, (value, key) => this._tickAnyCellSub[key].unsubscribe());
  }

  public initializeTimeSort(): void {
    if (this.table.sort.active !== 'time') {
      this.table.sort.sort({ id: 'time', start: 'desc', disableClear: false });
    }
  }

  private trackBy: RowTransform<ViewModel<ScanJobRunLog>, string> = (i, viewModel) => {
    const fromViewModel = JSON.stringify(['time', 'ip', 'status', 'duration', 'info']
      .reduce((agg, key) => {
        agg[key] = viewModel.cellMap[key];
        return agg;
      }, {}));
    return fromViewModel;
  }

  private initializeScanJobLogsSub(): void {
    if (this._scanJobLogsSub) {
      this._scanJobLogsSub.unsubscribe();
    }
    this.dataPopulated = false;
    this.totalRows = 0;
    this._scanJobLogsSub = this.poll()
      .catch(() => {
        return Observable.of({ total: 0, data: [] });
      })
      .subscribe(result => {
        this.dataPopulated = true;
        this.totalRows = result.total || result.data.length;
        if (this.byInterrupt) {
          this.polling$.next();
          this.selectedScanLogs = [];
          _.forEach(this._tickAllChangeSub, (value, key) => this._tickAllChangeSub[key].unsubscribe());
          _.forEach(this._tickAnyCellSub, (value, key) => this._tickAnyCellSub[key].unsubscribe());
        }
        this.polling$.next(result);
      });
  }

  private processTickedScanLog(checked: boolean, row: ScanJobRunLog) {
    if (checked) {
      this.selectedScanLogs.push(row.ip);
      return;
    }
    const foundIndex = this.selectedScanLogs.findIndex((iterator: string) => (iterator === row.ip));
    if (foundIndex > -1) {
      this.selectedScanLogs.splice(foundIndex, 1);
    }
  }

  private getScanJobScopes(): Observable<Scope[]> {
    return this.scopesService.getScanJobScopes(this.scanJobId).map(result => result.data).share();
  }

  private poll(): Observable<ScanJobsAPIResult<ScanJobRunLog>> {
    const searchParams = this.getSearchParams();
    const current$ = this.scanJobsService.getScanJobRunLogs(this.scanJobRunId, searchParams).map(this.coercer);
    const next$ = current$.delay(ScanJobLogComponent.pollingInterval).concatMap(() => {
      this.byInterrupt = false;
      return this.poll();
    });
    const interrupt$ = this.table.interrupt.concatMap(() => {
      this.byInterrupt = true;
      return this.poll();
    });
    return Observable.merge(current$, Observable.race(next$, interrupt$));
  }

  private getSearchParams(): IngestionMetricsSearchParams {
    if (!this.table) return { from: 0, pageSize: 5 };

    const fieldInfo = ScanJobLogComponent.columnToFieldInfoMap[this.table.sort.active];
    const orderBy = fieldInfo && ('metricScanDetails.' + fieldInfo.name + ((fieldInfo.type === 'string') ? '.keyword' : ''));
    const orderDir = this.table.sort.direction || undefined;

    const from = this.table.paginator.pageSize * this.table.paginator.pageIndex;
    const pageSize = this.table.paginator.pageSize;

    return { orderBy, orderDir, from, pageSize };
  }


  private coercer(result: any): ScanJobsAPIResult<ScanJobRunLog> {
    return {
      total: result.total,
      data: result.status.map(this.mapper)
    };
  }

  private mapper(d: any): ScanJobRunLog {
    return {
      time: d.metricScanDetails.startScanTimestamp || '-',
      ip: d.metricScanDetails.targetIP || '-',
      status: d.metricScanDetails.scanStatus || '-',
      duration: d.metricScanDetails.scanDuration || '-',
      info: d.metricScanDetails.additionalInfo || '-'
    };
  }

  removeFromScope(): void {
    const payload: RemoveFromScopePayload = {
      data: {
        list: _.uniq(this.selectedScanLogs).join(',')
      }
    };

    const _sub = this.scopesService.removeFromScope(this.selectedScope.id, payload)
      .finally(() => {
        _sub.unsubscribe();
        this.refresh();
      })
      .subscribe();
  }

  rescan(): void {
    const payload: RescanPayload = {
      addresses: _.uniq(this.selectedScanLogs).join(',')
    };

    const _sub = this.scanJobsService.rescan(this.scanJobId, payload)
      .finally(() => {
        _sub.unsubscribe();
        this.refresh();
      })
      .subscribe();
  }

  clearSelection(): void {
    this.clearSelection$.next();
    this.tickAll$.next(false);
    this.selectedScanLogs = [];
  }

  refresh(): void {
    this.operationDone$.next();
    this.byInterrupt = true;
    this.initializeScanJobLogsSub();
  }
}

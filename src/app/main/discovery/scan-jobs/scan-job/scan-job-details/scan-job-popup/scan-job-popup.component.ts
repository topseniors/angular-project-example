import { Component, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import Utils from '../../../../../../utils';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ScanJobRun, Transforms, ScanJobsAPIResult } from '../../../../../../services/apis/scanjobs.service';
import {
  SuperTableComponent, ColumnDefinition, RowTransform, ViewModel, IconColumn,
  ProgressColumn, RowDefinition
} from '../../../../../../components/super-table/super-table.component';
import { EffectIconComponent } from '../../../../../../components/effect-icon/effect-icon.component';
import { ProgressData, ProgressBar } from '../../../../../../components/progress-bar/progress-bar.component';
import { DateTimeCell } from '../../../../../../components/date-time-cell/date-time-cell.component';
import { ScanJobResultComponent } from '../scan-job-result/scan-job-result.component';
import { ScanJobLogComponent } from '../scan-job-log/scan-job-log.component';

@Component({
  selector: 'scan-job-popup',
  templateUrl: './scan-job-popup.component.html',
  styleUrls: ['./scan-job-popup.component.less']
})
export class ScanJobPopupComponent {

  @ViewChild(ScanJobResultComponent) scanResult;
  @ViewChild(ScanJobLogComponent) scanLog;
  @Input() scanJobId: string;
  @Input() scanJobRun$: Observable<ViewModel<ScanJobRun>>;
  @Input() scanJobRunId: string;
  @Input() trackBy: RowTransform<ViewModel<any>, string>;
  private opState: string;
  private endCode: string;
  private _scanJobRun$: Observable<ScanJobsAPIResult<any>>;

  private tabs = ['result', 'log'];
  private activeTabIndex = 0;

  private rowDefs: RowDefinition<ScanJobRun>[] = [
    {
      columns: ['status', 'started', 'duration', 'progress', 'totalDevices', 'scannedIPsScopeSize']
    }
  ];
  private columns: ColumnDefinition<any, any, any>[] = [

    <IconColumn<any>>
    {
      def: 'status',
      header: 'DISCOVERY.SCAN_JOBS.STATUS',
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      tooltip: (i, row) => {
        const translatedKey = this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS');
        const scanStatus = this.getScanStatusText();

        return `${translatedKey}:\n${scanStatus}`;
      }
    },

    <ColumnDefinition<any, DateTimeCell>>
    {
      def: 'started',
      header: 'DISCOVERY.SCAN_JOBS.STARTED',
      cell: this.resolver.resolveComponentFactory(DateTimeCell),
      tooltip: (i, row) => {
        if (!row.started) return '';
        const tooltipStr = this.translate.instant('DISCOVERY.SCAN_JOBS.STARTED') + ':\n' +
          this.datePipe.transform(row.started.started, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },

    <ColumnDefinition<any, string>>
    {
      def: 'duration',
      header: 'DISCOVERY.SCAN_JOBS.SCAN_DURATION'
    },

    <ProgressColumn<any>>
    {
      def: 'progress',
      header: 'DISCOVERY.SCAN_JOBS.PROGRESS',
      cell: this.resolver.resolveComponentFactory(ProgressBar)
    },

    <ColumnDefinition<any, number>>
    {
      def: 'totalDevices',
      header: 'DISCOVERY.SCAN_JOBS.TOTAL_DEVICES'
    },

    <ColumnDefinition<any, any>>
    {
      def : 'scannedIPsScopeSize',
      header: 'DISCOVERY.SCAN_JOBS.SCANNED_IPS_SCOPE_SIZE',
      cell : (i, j, cell) => {
        if (!cell) return '- / -';
        const scanned = this.decimalPipe.transform(cell.scanned);
        const scope = this.decimalPipe.transform(cell.scope);
        return `${scanned} / ${scope}`;
      }
    }
  ];

  constructor(
    private dialogRef: MatDialogRef<ScanJobPopupComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService,
    private resolver: ComponentFactoryResolver
  ) {
    this.convertStream = this.convertStream.bind(this);
    this.close = this.close.bind(this);
  }

  private getScanStatusText(): string {
    switch (this.opState) {
      case 'Unknown':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.UNKNOWN');
      case 'Idle':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.IDLE');
      case 'Starting':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.STARTING');
      case 'Running':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.RUNNING');
      case 'Pausing':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.PAUSING');
      case 'Paused':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.PAUSED');
      case 'Queued':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.QUEUED');
      case 'WaitingInput':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.WAITINGINPUT');
      case 'Resuming':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.RESUMING');
      case 'Ended':
        if (this.endCode === 'AbortedByUser') return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ABORTED');
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ENDED');
      case 'CompletedNOK':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.COMPLETEDNOK');
      case 'Aborting':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ABORTING');
      case 'Aborted':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ABORTED');
      default:
        return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.UNKNOWN');
    }
  }

  public tab(tab: string): void {
    this.activeTabIndex = this.tabs.indexOf(tab);
    this._scanJobRun$ = this.scanJobRun$.map(this.convertStream);
    setTimeout(() => {
      this.onTabChanged(this.activeTabIndex);
    });
  }

  public onTabChanged(tabIndex: number): void {
    if (tabIndex === 0) {
      return this.scanResult.initializeTimeSort();
    }

    if (tabIndex === 1) {
      return this.scanLog.initializeTimeSort();
    }
    return;
  }

  private close(): void {
    this.dialogRef.close();
  }

  private convertStream(viewModel: ViewModel<ScanJobRun>): ScanJobsAPIResult<any> {
    this.opState = viewModel.row.opState;
    this.endCode = viewModel.row.endCode;

    const converted = this.rowDefs[0].columns.reduce((a, b) => {
      a[b] = viewModel.cellMap[b]; return a;
    }, {});
    (<any>converted).id = viewModel.row.id[2];
    return {data: [converted], total: 1};
  }

}

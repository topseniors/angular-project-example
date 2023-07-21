import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  TemplateRef,
  ComponentFactoryResolver
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import {
  ScanJobsService,
  ScanJobsAPIResult,
  ScanJobRun,
  ScanJob,
  Transforms
} from 'app/services/apis/scanjobs.service';
import { ToastrService, Action } from 'app/services/toastr.service';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  IconColumn,
  ProgressColumn,
  ExpandedRowTemplateInput,
  ExpandedRowContext,
  RowDefinition
} from 'app/components/super-table/super-table.component';
import { ProgressBar, ProgressData } from 'app/components/progress-bar/progress-bar.component';
import { ConfirmationModalComponent } from 'app/components/confirmation-modal/confirmation-modal.component';
import { ActionButton, ActionButtonEvent } from '../../../../../components/table-actions-button/table-actions-button.component';
import { EffectIconComponent } from 'app/components/effect-icon/effect-icon.component';
import { MatSnackBarInjectedData } from 'app/components/notification/notification.component';
import Utils from 'app/utils';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ScanJobPopupComponent } from 'app/main/discovery/scan-jobs/scan-job/scan-job-details/scan-job-popup/scan-job-popup.component';
import { DateTimeCell, DateTimeToken } from '../../../../../components/date-time-cell/date-time-cell.component';

interface InfoToken {
  name: string;
  value: string;
}

type RowModel = ScanJob;

@Component({
  selector    : 'scan-job-details',
  templateUrl : './scan-job-details.component.html',
  styleUrls   : ['./scan-job-details.component.less']
})
export class ScanJobDetailsComponent implements AfterViewInit, OnDestroy {
  private scanJob: ScanJob = this.route.parent.snapshot.data.scanJob;
  private infos: InfoToken[] = this.setupInfos();
  private menuItems = this.makeMenu();

  // Table config
  @ViewChild('expanded') expandedRowTemplate: TemplateRef<ExpandedRowContext<ScanJobRun>>;
  @ViewChild(SuperTableComponent) table: SuperTableComponent<ScanJobRun>;

  private trackBy: RowTransform<ViewModel<ScanJobRun>, string> = (i, viewModel) => {
    const columns = ['status', 'started', 'duration', 'progress', 'totalDevices', 'scannedIPsScopeSize'];
    const fromViewModel = columns.reduce((agg, key) => {
      agg[key] = viewModel.cellMap[key];

      return agg;
    }, {});


    return JSON.stringify(fromViewModel);
  }

  rowDefs: RowDefinition<ScanJobRun>[] = [{
    columns: [
      'status',
      'started',
      'duration',
      'progress',
      'totalDevices',
      'scannedIPsScopeSize'
    ]
  }];

  columns: ColumnDefinition<ScanJobRun, any, any>[] = [
    <IconColumn<ScanJobRun>>
    {
      def      : 'status',
      header   : 'DISCOVERY.SCAN_JOBS.STATUS',
      row2cell : (i, row) => ({
        extension: '.svg',
        icon     : Transforms.statusIconTransform(i, row),
        effect   : Transforms.statusEffectTransform(i, row),
        title    : ''
      }),
      cell    : this.resolver.resolveComponentFactory(EffectIconComponent),
      sort    : cell => cell.icon + cell.effect || '',
      tooltip : (i, row) => {
        const translatedKey = this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS');
        const scanStatus = this.getScanStatusText(row);

        return `${translatedKey}:\n${scanStatus}`;
      },
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('log', viewModel.row);
      }
    },

    <ColumnDefinition<ScanJobRun, DateTimeToken, DateTimeCell>>
    {
      def      : 'started',
      header   : 'DISCOVERY.SCAN_JOBS.STARTED',
      row2cell : (i, row) => ({ started: row.started }),
      cell     : this.resolver.resolveComponentFactory(DateTimeCell),
      sort     : cell => cell.started,
      tooltip  : (i, row) => {
        if (!row.started) return '';
        const tooltipStr = this.translate.instant('DISCOVERY.SCAN_JOBS.STARTED') + ':\n' +
          this.datePipe.transform(row.started, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      },
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('log', viewModel.row);
      }
    },

    <ColumnDefinition<ScanJobRun, string>>
    {
      def      : 'duration',
      header   : 'DISCOVERY.SCAN_JOBS.SCAN_DURATION',
      row2cell : (i, row) => {
        if (!row.ended) return '-';
        const elapsed = moment.duration(row.ended - row.started);
        return Utils.formatDuration(elapsed);
      },
      sort : true,
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('log', viewModel.row);
      }
    },

    <ProgressColumn<ScanJobRun>>
    {
      def      : 'progress',
      header   : 'DISCOVERY.SCAN_JOBS.PROGRESS',
      row2cell : (i: number, row: ScanJobRun) => ({
        data: Transforms.progressTransform(i, row),
        onTooltipItemClicked: () => { this.popup('log', row); }
      }),
      sort     : ((d: {data: ProgressData}) => {
        if (!d.data) return -1;
        const done = _.map(d.data.channels || [], 'count').reduce((a, b) => a + b, 0);
        return done / d.data.total;
      }),
      cell     : this.resolver.resolveComponentFactory(ProgressBar),
      onCellClicked : (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('log', viewModel.row);
      }
    },

    <ColumnDefinition<ScanJobRun, any>>
    {
      def           : 'totalDevices',
      header        : 'DISCOVERY.SCAN_JOBS.TOTAL_DEVICES',
      row2cell      : (i, row) => '-',
      sort          : true,
      onCellClicked : (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('result', viewModel.row);
      }
    },

    <ColumnDefinition<ScanJobRun, any>>
    {
      def      : 'scannedIPsScopeSize',
      row2cell : (i, row) => {
        if (!row.resultData) return null;
        const scanned = row.resultData.current || 0;
        const scope = row.resultData.total || 0;
        return { scanned, scope };
      },
      header   : 'DISCOVERY.SCAN_JOBS.SCANNED_IPS_SCOPE_SIZE',
      cell     : (i, j, cell) => {
        if (!cell) return '- / -';
        const scanned = this.decimalPipe.transform(cell.scanned);
        const scope = this.decimalPipe.transform(cell.scope);
        return `${scanned} / ${scope}`;
      },
      sort: (cell: any) => ((cell) ? cell.scope : 0),
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.popup('log', viewModel.row);
      }
    }
  ];

  // Async attributes
  private polling$;

  private intervalHandler;

  // static attributes
  private static readonly pollingInterval = 15000;
  private static readonly infoItems = [
    { translateKey : 'DISCOVERY.SCAN_JOBS.TYPE',      itemAttribute : 'scanType'         },
    { translateKey : 'DISCOVERY.SCAN_JOBS.APPLIANCE', itemAttribute : 'jobApplianceName' },
    { translateKey : 'DISCOVERY.SCAN_JOBS.SCOPES',    itemAttribute : 'scopesNames'      },
    { translateKey : 'DISCOVERY.SCAN_JOBS.KEYCHAINS', itemAttribute : 'kcNames'          },
    { translateKey : 'DISCOVERY.SCAN_JOBS.NEXT_RUN',  itemAttribute : 'nextFire'         }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private scanJobsService: ScanJobsService,
    private resolver: ComponentFactoryResolver,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toastrService: ToastrService
  ) {
    const scanJobId = this.scanJob.id;
    if (!scanJobId) {
      this.back();
      return;
    }

    this.refresh = this.refresh.bind(this);
    this.rowDefs[0].onRowClicked = this.onRowClicked.bind(this);
    this.polling$ = this.poll(scanJobId.join(':'));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.table.sort.sort({ id: 'started', start: 'desc', disableClear: false });
      const { openScanResultOfLatestRun, openScanLogOfLatestRun } = this.route.snapshot.params;
      if (openScanResultOfLatestRun === 'true' || openScanLogOfLatestRun === 'true') {
        const subscriber = this.scanJobsService.getScanJobRuns(this.scanJob.id.join(':'))
          .finally(() => subscriber.unsubscribe())
          .subscribe((scanJobRuns: ScanJobsAPIResult<ScanJobRun>) => {
            if (scanJobRuns && scanJobRuns.data && scanJobRuns.data.length > 0) {
              const latestRun = _.sortBy(scanJobRuns.data, [iterator => parseInt(iterator.started, 10) * (-1)])[0];
              if (openScanResultOfLatestRun === 'true') {
                this.popup('result', latestRun);
              }
              if (openScanLogOfLatestRun === 'true') {
                this.popup('log', latestRun);
              }
            }
          });
      }
    });
    this.intervalHandler = setInterval(this.refreshScanJobDetails.bind(this), ScanJobDetailsComponent.pollingInterval);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalHandler);
  }

  private setupInfos(): InfoToken[] {
    return ScanJobDetailsComponent.infoItems.map(({translateKey, itemAttribute}) => {
      const entireValue = this.scanJob[itemAttribute];
      // Call toString in case value is an array
      const [value, ...rest] = (entireValue || '-').toString().split(',');

      const item = {
        name : translateKey,
        value,
        tooltip: '',
      };

      if (rest && rest.length) {
        item.tooltip = this.translate.instant(translateKey) + ':\n' + entireValue;
      }

      return item;
    });
  }

  private back(): void {
    this.router.navigate(['..'], {
      relativeTo : this.route.parent
    });
  }

  private refreshScanJobDetails(): void {
    const sub = this.scanJobsService.getScanJob(this.scanJob.id.join(':')).take(1)
      .finally(() => sub.unsubscribe())
      .subscribe((scanJob: ScanJob) => {
        if (scanJob) {
          const scanJobOpStateTransitionResult = this.getScanJobOpStateTransitionResult(scanJob, this.scanJob);
          const originalProgress = this.scanJob.progress;
          this.scanJob = { ...scanJob, progress: originalProgress };
          this.menuItems = this.makeMenu();

          if (!scanJobOpStateTransitionResult) return;

          const innerSub = this.scanJobsService.getScanJobRuns(scanJob.id.join(':'))
            .finally(() => innerSub.unsubscribe())
            .subscribe((scanJobRuns: ScanJobsAPIResult<ScanJobRun>) => {
              if (scanJobRuns && scanJobRuns.data && scanJobRuns.data.length > 0) {
                const latestRun = _.sortBy(scanJobRuns.data, [iterator => parseInt(iterator.started, 10) * (-1)])[0];
                const toastrInjectedData: MatSnackBarInjectedData = {
                  operationError: false,
                  title: this.translate.instant(scanJobOpStateTransitionResult, { scanJobName: scanJob.name }),
                  action: () => {
                    this.popup('result', latestRun);
                  },
                  actionLabel: 'DISCOVERY.SCAN_JOBS.SHOW_RESULTS'
                };

                this.toastrService.show(toastrInjectedData, null);
              }
            });

          return;
        }

        this.scanJob = null;
        this.router.navigate(['..']);
      });
  }

  private getScanJobRuns(scanJobId: string): Observable<ScanJobsAPIResult<ScanJobRun>> {
    return this.scanJobsService.getScanJobRuns(scanJobId)
      .do((scanJobRuns) => {
        if (scanJobRuns && scanJobRuns.data && scanJobRuns.data.length > 0) {
          const latestRun = _.sortBy(scanJobRuns.data, [iterator => parseInt(iterator.started, 10) * (-1)])[0];
          this.scanJob.progress = latestRun.progress;
        }
      });
  }

  private poll(scanJobId: string): Observable<ScanJobsAPIResult<ScanJobRun>> {
    const current$: Observable<ScanJobsAPIResult<ScanJobRun>> = this.getScanJobRuns(scanJobId);
    const next$: Observable<ScanJobsAPIResult<ScanJobRun>> =
      current$.delay(ScanJobDetailsComponent.pollingInterval).concatMap(() => this.poll(scanJobId));

    return Observable.merge(current$, next$);
  }

  private popup(tab: string, row: ScanJobRun): void {
    // Until we upgrade material, ScrollStrategy won't be available
    // scrollStrategy: new NoopScrollStrategy()
    const config: MatDialogConfig = { panelClass: 'scanjobdetails-popup', position: { top: '250px' } };
    const dialogRef = this.dialog.open(ScanJobPopupComponent, config);
    const findFn = viewModel => {
      return viewModel.row.id[2] === row.id[2];
    };

    dialogRef.componentInstance.scanJobId = this.scanJob.id.join(':');
    dialogRef.componentInstance.scanJobRunId = row.id.join(':');
    dialogRef.componentInstance.scanJobRun$ = this.table.output$.map(viewModels => {
      return viewModels.find(findFn);
    }).startWith(this.table.output$.value.find(findFn));

    dialogRef.componentInstance.trackBy = this.trackBy;
    dialogRef.componentInstance.tab(tab);
  }

  private getScanStatusText(scanJobRun: ScanJobRun): string {
    switch (scanJobRun.opState) {
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
        if (scanJobRun.endCode === 'AbortedByUser') return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ABORTED');
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

  private getScanJobOpStateTransitionResult(newScanJob: ScanJob, oldScanJob: ScanJob): string {
    if (!newScanJob || !oldScanJob) return null;
    if (newScanJob.opState === oldScanJob.opState) return null;

    if (newScanJob.opState === 'Ended') {
      if (newScanJob.endCode === 'AbortedByUser') {
        return 'DISCOVERY.SCAN_JOBS.ENDED_ABORTED_BY_USER';
      }
      return 'DISCOVERY.SCAN_JOBS.COMPLETED_SUCCESSFULLY';
    }

    if (newScanJob.opState === 'CompletedNOK') {
      return 'DISCOVERY.SCAN_JOBS.COMPLETED_BUT_NOT_OK';
    }

    return null;
  }

  private startJob(): void {
    const scanJobId = this.scanJob.id.join(':');
    const _sub = this.scanJobsService.start(scanJobId)
      .finally(() => {
        this.menuItems = this.makeMenu();
        this.refresh();
        _sub.unsubscribe();
      })
      .subscribe((scanJobs: ScanJob[]) => this.scanJob = scanJobs[0]);
  }

  private stopJob(): void {
    const scanJobId = this.scanJob.id.join(':');
    const _sub = this.scanJobsService.stop(scanJobId)
      .finally(() => {
        this.menuItems = this.makeMenu();
        this.refresh();
        _sub.unsubscribe();
      })
      .subscribe((scanJobs: ScanJob[]) => this.scanJob = scanJobs[0]);
  }

  private abortJob(): void {
    const scanJobId = this.scanJob.id.join(':');
    const _sub = this.scanJobsService.abort(scanJobId)
      .finally(() => {
        this.menuItems = this.makeMenu();
        this.refresh();
        _sub.unsubscribe();
      })
      .subscribe((scanJobs: ScanJob[]) => this.scanJob = scanJobs[0]);
  }

  private cloneJob(): void {
    const scanJobId = this.scanJob.id.join(':');
    const cloneName = 'Clone of ' + this.scanJob.name;
    const _sub = this.scanJobsService.clone(scanJobId, cloneName)
      .finally(() => {
        this.menuItems = this.makeMenu();
        this.refresh();
        _sub.unsubscribe();
      })
      .subscribe();
  }

  private deleteJob(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: { message: 'DISCOVERY.SCAN_JOBS.DELETE_CONFIRMATION' }
    });
    const dialogSub = dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const scanJobId = this.scanJob.id.join(':');
        const _sub = this.scanJobsService.delete(scanJobId)
          .finally(() => {
            this.menuItems = this.makeMenu();
            this.refresh();
            _sub.unsubscribe();
          })
          .subscribe(() => this.back());
      }
      dialogSub.unsubscribe();
    });
  }

  private configurable(): boolean {
    const { opState } = this.scanJob;
    const opStates = ['Idle', 'Ended', 'Aborted', 'CompletedNOK', 'Unknown'];

    return (opStates.indexOf(opState) > -1);
  }

  public goToConfig(): void {
    const id = this.scanJob.id.join(':');

    const navigationExtras = {
      queryParams: {
        scanJobId: id
      }
    };

    this.router.navigate(['/main/discovery/sencha'], navigationExtras);
  }

  private startDisabled(): boolean {
    const { opState, confState } = this.scanJob;

    return (opState === 'Idle' && confState !== 'OK');
  }

  private performOperation(): void {
    const { opState, confState } = this.scanJob;

    switch (opState) {
      case 'Idle':
        if (confState !== 'OK') return;
      case 'Ended':
      case 'Aborted':
      case 'CompletedNOK':
        this.startJob();
        break;
      case 'Starting':
      case 'Running':
      case 'Pausing':
      case 'Paused':
      case 'Queued':
      case 'Resuming':
        this.stopJob();
        break;
      case 'Aborting':
        this.abortJob();
        break;
      case 'Unknown':
      default:
        break;
    }
  }

  private makeMenu(): ActionButton<RowModel>[] {
    const menuActionsMap = {
      START  : this.startJob,
      STOP   : this.stopJob,
      ABORT  : this.abortJob,
      CLONE  : this.cloneJob,
      DELETE : this.deleteJob
    };

    const actionKeys = (scanJob => {
      switch (scanJob.opState) {
        case 'Idle':
          if (scanJob.confState !== 'OK') return ['CLONE', 'DELETE'];
        case 'Ended':
        case 'Aborted':
        case 'CompletedNOK':
          return ['START', 'CLONE', 'DELETE'];
        case 'Starting':
        case 'Running':
        case 'Pausing':
        case 'Paused':
        case 'Queued':
        case 'Resuming':
          return ['STOP', 'CLONE'];
        case 'Aborting':
          return ['ABORT', 'CLONE'];
        case 'Unknown':
        default:
          return ['CLONE', 'DELETE'];
      }
    })(this.scanJob);

    return actionKeys.map(key => {
      const events = new Subject<ActionButtonEvent<RowModel>>();

      events.subscribe(menuActionsMap[key].bind(this));

      return {
        events,
        key,
        title : `DISCOVERY.SCAN_JOBS.ACTIONMENU.${key}`
      };
    });
  }

  canStop(): boolean {
    const { opState } = this.scanJob;

    switch (opState) {
      case 'Starting':
      case 'Running':
      case 'Pausing':
      case 'Paused':
      case 'Queued':
      case 'Resuming':
        return true;
      default:
        return false;
    }
  }

  canStart(): boolean {
    const { opState, confState } = this.scanJob;

    switch (opState) {
      case 'Idle':
        if (confState !== 'OK') return false;
      case 'Ended':
      case 'Aborted':
      case 'CompletedNOK':
        return true;
      default:
        return false;
    }
  }

  canAbort(): boolean {
    return (this.scanJob.opState === 'Aborting');
  }

  public refresh(): void {
    this.polling$ = this.poll(this.scanJob.id.join(':'));
  }

  private onRowClicked(rowIndex: number, row: RowModel, $event): void {
    const matTable = Utils.closestByClass($event.target, 'mat-table');
    if (!matTable) return;

    const rows = matTable.children;

    for (let i = 1; i < rows.length; i++) {
      rows[i].classList.remove('active');
    }

    const selectedMatRow = Utils.closestByClass($event.target, 'mat-row');
    if (!selectedMatRow) return;

    selectedMatRow.classList.add('active');
  }
}

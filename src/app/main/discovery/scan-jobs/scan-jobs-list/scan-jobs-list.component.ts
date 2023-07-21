import {
  Input, Output, Component, ComponentFactoryResolver, EventEmitter,
  ViewChild, OnInit, AfterViewInit, OnDestroy, Inject, HostListener
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, Subject, BehaviorSubject } from 'rxjs/Rx';
import {
  ScanJobsService, ScanJobsAPIResult, ScanJob,
  Transforms, OpState, ScanJobSearchParams
} from '../../../../services/apis/scanjobs.service';
import { ToastrService } from '../../../../services/toastr.service';
import { UtilsService } from '../../../../services/utils.service';
import { AppliancesService, Appliance } from '../../../../services/apis/appliances.service';
import { ProgressBar, ProgressData } from '../../../../components/progress-bar/progress-bar.component';
import { ConfirmationModalComponent } from '../../../../components/confirmation-modal/confirmation-modal.component';
import {
  TableActionsButtonComponent, ActionButton, ActionButtonHandler, ActionButtonEvent
} from '../../../../components/table-actions-button/table-actions-button.component';
import { EffectIconComponent } from '../../../../components/effect-icon/effect-icon.component';
import {
  SuperTableComponent, ColumnDefinition, RowTransform, ViewModel, PaginationOptions,
  ActionColumn, IconColumn, ProgressColumn, RowDefinition, DEFAULT_PAGESIZE_OPTIONS
} from '../../../../components/super-table/super-table.component';
import { MatSnackBarInjectedData } from 'app/components/notification/notification.component';
import Utils from '../../../../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

const needToRefreshList: Subject<void> = new Subject<void>();

export type BadConfigInitFn = (instance: BadConfigCell) => void;
export type BadConfigColumn<T> = ColumnDefinition<T, BadConfigInitFn, BadConfigCell>;
@Component({
  selector: 'bad-config',
  styles: ['i.fa.fa-cog { font-size: 16px; color: #9b9b9b; margin-right: 5px; }'],
  template: `
    <div [mdePopoverTriggerFor]="confErrorReason" mdePopoverTriggerOn="hover">
      <i class="fa fa-cog" aria-hidden="true"></i>
      {{'DISCOVERY.SCAN_JOBS.NOT_PROPERLY_CONFIGURED' | translate}}
      <a class="link-config" (click)="onClick($event)"><u>{{'DISCOVERY.SCAN_JOBS.CONFIGURE_IT_HERE' | translate}}</u></a>
    </div>
    <mde-popover class="conf-error-reason" #confErrorReason="mdePopover" [mdePopoverOverlapTrigger]="false">
      <mat-card>
        <mat-card-content>
          <div [innerHTML]="scanJob.confErrorReason"></div>
        </mat-card-content>
      </mat-card>
    </mde-popover>
  `
})
export class BadConfigCell {
  @Input() scanJob: ScanJob;
  constructor(private router: Router) {}
  private onClick(event: Event) {
    const id = this.scanJob.id.join(':');

    event.stopImmediatePropagation();
    event.stopPropagation();

    const navigationExtras = {
      queryParams : {
        scanJobId : id
      }
    };

    this.router.navigate(['/main/discovery/sencha'], navigationExtras);
  }
}

export type NotRunYetInitFn = (instance: NotRunYetCell) => void;
export type NotRunYetColumn<T> = ColumnDefinition<T, NotRunYetInitFn, NotRunYetCell>;
@Component({
  selector: 'not-run-yet',
  template: `
    <div>
      <span class="icon-play"></span>
      {{'DISCOVERY.SCAN_JOBS.NOT_RUN_YET' | translate}}
      <a class="link-start-now" (click)="onClick($event)"><u>{{'DISCOVERY.SCAN_JOBS.START_NOW' | translate}}</u></a>
    </div>
  `
})
export class NotRunYetCell {
  @Input() scanJob: ScanJob;
  constructor(private scanJobsService: ScanJobsService) {}
  private onClick(event: Event) {
    const scanJobId = this.scanJob.id.join(':');

    event.stopImmediatePropagation();
    event.stopPropagation();

    const _sub = this.scanJobsService.start(scanJobId)
      .finally(() => _sub.unsubscribe())
      .subscribe(() => {
        needToRefreshList.next();
      });
  }
}

interface SubtitleToken { name: string; count: number; }
interface RowModel { scanJob: ScanJob; appliance: Appliance; customCSSClass: string; }

@Component({
  selector: 'app-scan-jobs-list',
  templateUrl: './scan-jobs-list.component.html',
  entryComponents: [BadConfigCell, NotRunYetCell],
  styleUrls: ['./scan-jobs-list.component.less']
})
export class ScanJobsListComponent implements AfterViewInit, OnDestroy {
  // static attributes
  private static readonly pollingInterval = 15000;

  // table config
  linked = this.route.snapshot.data.linked;
  filtering = {
    placeholder: this.linked ? '' : 'DISCOVERY.SCAN_JOBS.FILTERBYNAME'
  };
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;
  columns: ColumnDefinition<RowModel, any, any>[] = [
    <IconColumn<RowModel>>{
      def: 'status',
      header: '',
      row2cell: (i, row) => ({
        extension: '.svg',
        icon: Transforms.statusIconTransform(i, row.scanJob),
        effect: Transforms.statusEffectTransform(i, row.scanJob),
        title: ''
      }),
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      sort: this.linked && (cell => cell.icon + cell.effect || ''),
      tooltip: (i, row) =>
        this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS') + ':\n' +
        this.getScanStatusText(row.scanJob)
    },

    <ColumnDefinition<RowModel, string>>{
      def: 'name',
      header: 'DISCOVERY.SCAN_JOBS.JOB_NAME',
      row2cell: (i, row) => row.scanJob.name || '-',
      sort: true,
      tooltip: (i, row) =>
        row.scanJob.isTemporary ? 'DISCOVERY.SCAN_JOBS.TEMPORARY_DESCRIPTION' : ''
    },

    <ColumnDefinition<RowModel, Appliance>>{
      def: 'appliance',
      header: 'DISCOVERY.SCAN_JOBS.APPLIANCE',
      row2cell: (i, row) => row.appliance,
      cell: (i, j, cell) => (cell && cell.name) || '-',
      sort: this.linked && (cell => (cell && cell.name) || '')
    },

    <IconColumn<RowModel>>{
      def: 'scanType',
      row2cell: (i, row) => ({
        extension: '.svg',
        icon: Transforms.typeIconTransform(i, row.scanJob),
        title: ''
      }),
      header: 'DISCOVERY.SCAN_JOBS.TYPE',
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      sort: !this.linked || (cell => cell.icon || ''),
      tooltip: (i, row) =>
        this.translate.instant('DISCOVERY.SCAN_JOBS.TYPE') + ':\n' + this.transformScanType(row.scanJob.scanType)
    },

    <ColumnDefinition<RowModel, number>>{
      def: 'started',
      header: 'DISCOVERY.SCAN_JOBS.LAST_STARTED',
      row2cell: (i, row) => row.scanJob.started,
      cell: (i, j, cell) => {
        if (!cell) return '-';
        const startTime: moment.Moment = moment(cell);
        const now: moment.Moment = moment();
        return moment.duration(now.diff(startTime)).humanize() + ' ago'; // TODO i18n
      },
      sort: true,
      tooltip: (i, row) => {
        if (!row.scanJob.started) return '';
        const tooltipStr = this.translate.instant('DISCOVERY.SCAN_JOBS.LAST_STARTED') + ':\n' +
          this.datePipe.transform(row.scanJob.started, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },

    <ProgressColumn<RowModel>>{
      def: 'progress',
      row2cell: (i, row) => ({
        data: Transforms.progressTransform(i, row.scanJob),
        onTooltipItemClicked: () => { this.onProgressTooltipItemClicked(row.scanJob.id[2]); }
      }),
      header: 'DISCOVERY.SCAN_JOBS.PROGRESS',
      sort:
        this.linked &&
        ((d: { data: ProgressData }) => {
          if (!d.data) return -1;
          const done = _.map(d.data.channels || [], 'count').reduce(
            (a, b) => a + b,
            0
          );
          return done / d.data.total;
        }),
      cell: this.resolver.resolveComponentFactory(ProgressBar)
    },

    <ColumnDefinition<RowModel, string>>{
      def: 'timeRemaining',
      row2cell: (i, row) =>
        (row.scanJob.progressMsg && row.scanJob.progressMsg[2]) || '0',
      header: 'DISCOVERY.SCAN_JOBS.TIME_REMAINING',
      cell: (i, j, cell) => {
        if (cell === '0') return '-';
        const remaining: moment.Duration = moment.duration(cell);
        return Utils.formatDuration(remaining);
      },
      sort: this.linked
    },

    <ColumnDefinition<RowModel, any>>{
      def: 'scannedIPsScopeSize',
      row2cell: (i, row) => {
        if (!row.scanJob.resultData) return null;
        const scanned = row.scanJob.resultData.current || 0;
        const scope = row.scanJob.resultData.total || 0;
        return { scanned, scope };
      },
      header: 'DISCOVERY.SCAN_JOBS.SCANNED_IPS_SCOPE_SIZE',
      cell: (i, j, cell) => {
        if (!cell) return '- / -';
        const scanned = this.decimalPipe.transform(cell.scanned);
        const scope = this.decimalPipe.transform(cell.scope);
        return `${scanned} / ${scope}`;
      },
      sort: this.linked && ((cell: any) => ((cell) ? cell.scope : 0))
    },

    <ColumnDefinition<RowModel, number>>{
      def: 'nextRun',
      header: 'DISCOVERY.SCAN_JOBS.NEXT_RUN',
      row2cell: (i, row) => row.scanJob.nextFire,
      cell: (i, j, cell) => ((!cell) ? '-' : this.datePipe.transform(cell, 'MMM dd, yyyy')),
      sort: (cell: any) => ((cell) ? cell : 0),
      tooltip: (i, row) => {
        if (!row.scanJob.nextFire) return '';
        const tooltipStr = this.translate.instant('DISCOVERY.SCAN_JOBS.NEXT_RUN') + ':\n' +
          this.datePipe.transform(row.scanJob.nextFire, 'MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },

    <ActionColumn<RowModel>>{
      def: 'actions',
      row2cell: (i, row) => ({
        rowData: row,
        menuItems: this.makeMenu(row.scanJob)
      }),
      header: '',
      cell: this.resolver.resolveComponentFactory(TableActionsButtonComponent)
    },

    <BadConfigColumn<RowModel>>{
      def: 'badConfig',
      row2cell: (i, row) => {
        return (instance: BadConfigCell) => {
          instance.scanJob = row.scanJob;
        };
      },
      cell: this.resolver.resolveComponentFactory(BadConfigCell)
    },

    <NotRunYetColumn<RowModel>>{
      def: 'notRunYet',
      row2cell: (i, row) => {
        return (instance: NotRunYetCell) => {
          instance.scanJob = row.scanJob;
        };
      },
      cell: this.resolver.resolveComponentFactory(NotRunYetCell)
    }
  ];
  rowDefs: RowDefinition<RowModel>[] = [
    {
      columns: ['status', 'name', 'appliance', 'scanType', 'started', 'progress',
        'timeRemaining', 'scannedIPsScopeSize', 'nextRun', 'actions'],
      predicate: (index, viewModel) => {
        return viewModel.row.scanJob.started && viewModel.row.scanJob.confState === 'OK';
      }
    },
    {
      columns: ['status', 'name', 'appliance', 'scanType', 'badConfig', 'actions'],
      predicate: (index, viewModel) => {
        return viewModel.row.scanJob.confState !== 'OK';
      }
    },
    {
      columns: ['status', 'name', 'appliance', 'scanType', 'notRunYet', 'actions'],
      predicate: (index, viewModel) => {
        return (!viewModel.row.scanJob.started);
      }
    }
  ];

  private _refreshSub: Subscription;
  private _sub: Subscription;
  // async attributes
  private interrupt$: Observable<void> = new Subject<void>();
  polling$: Observable<ScanJobsAPIResult<RowModel>> = this.poll();
  subTitleInfo$: Observable<string> = this.setupSubTitleInfo();
  private userOperatedScanJobIds: string[] = [];

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    const fromViewModel = JSON.stringify(['status', 'name', 'scanType', 'progress', 'timeRemaining', 'started']
      .reduce((agg, key) => {
        agg[key] = viewModel.cellMap[key];
        return agg;
      }, {})
    );
    // because custom factory inputs don't get cached in the viewModel
    const fromRow = viewModel.row.scanJob.nextFire;
    return fromViewModel + fromRow;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private scanJobsService: ScanJobsService,
    private toastrService: ToastrService,
    private appliancesService: AppliancesService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService
  ) {
    this.refresh = this.refresh.bind(this);
    this.rowDefs.forEach((rowDef) => {
      rowDef.onRowClicked = this.onRowClicked.bind(this);
      rowDef.onRowDoubleClicked = this.onRowDoubleClicked.bind(this);
    });
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngAfterViewInit(): void {
    if (!this.linked) {
      this._sub = Observable.merge
        .apply(null, [
          this.table.filter.stateChanges
            // in case the stateChanges event of the filter box is triggering too often use this instead:
            .map(() => this.table.filter.value)
            .debounceTime(250)
            .distinctUntilChanged(),
          this.table.sort.sortChange,
          this.table.paginator.page
        ])
        .subscribe(() => {
          (<Subject<void>>this.interrupt$).next();
        });
    }

    this._refreshSub = needToRefreshList.subscribe(() => {
      this.refresh();
    });

    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
      this.table.sort.sort({ id: 'name', start: 'asc', disableClear: false });
    });
  }

  ngOnDestroy(): void {
    if (!this.linked) {
      if (this._sub) this._sub.unsubscribe();
    }
    this._refreshSub.unsubscribe();
  }

  private setupSubTitleInfo(): Observable<string> {
    return this.polling$
      .concatMap((result: ScanJobsAPIResult<RowModel>) => {
        const tokens: SubtitleToken[] = _.chain(result.data)
          .map('scanJob')
          .countBy('scanType')
          .entries()
          .map(([k, v]) => ({ name: this.transformScanType(k), count: v }))
          .value();
        const tokens$: Observable<string>[] = tokens.map(
          (token: SubtitleToken) => {
            return this.translate.get('DISCOVERY.SCAN_JOBS.SUBTITLE', token);
          }
        );
        return Observable.combineLatest(tokens$).map(([...data]) => data.join('&ensp; &#x2022 &ensp;'));
      })
      .share();
  }

  private getScanStatusText(scanJob: ScanJob): string {
    switch (scanJob.opState) {
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
        if (scanJob.endCode === 'AbortedByUser') return this.translate.instant('DISCOVERY.SCAN_JOBS.STATUS_TEXT.ABORTED');
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

  private transformScanType(scanType: string): string {
    switch (scanType) {
      case 'Credentialess':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.TYPES.CREDENTIALESS');
      case 'Sequential':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.TYPES.SEQUENTIAL');
      case 'SpiralApp':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.TYPES.APPLICATION');
      case 'SpiralAll':
        return this.translate.instant('DISCOVERY.SCAN_JOBS.TYPES.NEIGHBORHOOD');
      default:
        return '';
    }
  }

  private getMenuActionsMap(): { [action: string]: ActionButtonHandler<RowModel> } {
    return {
      START: (payload: ActionButtonEvent<RowModel>) => {
        const scanJobId = payload.rowData.scanJob.id.join(':');
        if (this.userOperatedScanJobIds.indexOf(scanJobId) < 0) {
          this.userOperatedScanJobIds.push(scanJobId);
        }
        const _sub = this.scanJobsService.start(scanJobId)
          .finally(() => { this.refresh(); _sub.unsubscribe(); })
          .subscribe();
      },
      STOP: (payload: ActionButtonEvent<RowModel>) => {
        const scanJobId = payload.rowData.scanJob.id.join(':');
        if (this.userOperatedScanJobIds.indexOf(scanJobId) < 0) {
          this.userOperatedScanJobIds.push(scanJobId);
        }
        const _sub = this.scanJobsService.stop(scanJobId)
          .finally(() => { this.refresh(); _sub.unsubscribe(); })
          .subscribe();
      },
      ABORT: (payload: ActionButtonEvent<RowModel>) => {
        const scanJobId = payload.rowData.scanJob.id.join(':');
        if (this.userOperatedScanJobIds.indexOf(scanJobId) < 0) {
          this.userOperatedScanJobIds.push(scanJobId);
        }
        const _sub = this.scanJobsService.abort(scanJobId)
          .finally(() => { this.refresh(); _sub.unsubscribe(); })
          .subscribe();
      },
      CLONE: (payload: ActionButtonEvent<RowModel>) => {
        const scanJobId = payload.rowData.scanJob.id.join(':');
        const cloneName = 'Clone of ' + payload.rowData.scanJob.name;
        const _sub = this.scanJobsService.clone(scanJobId, cloneName)
          .finally(() => { this.refresh(); _sub.unsubscribe(); })
          .subscribe();
      },
      DELETE: (payload: ActionButtonEvent<RowModel>) => {
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '300px',
          data: { message: 'DISCOVERY.SCAN_JOBS.DELETE_CONFIRMATION' }
        });

        const dialogSub = dialogRef.afterClosed().subscribe(confirm => {
          if (confirm) {
            const scanJobId = payload.rowData.scanJob.id.join(':');
            const _sub = this.scanJobsService.delete(scanJobId)
              .finally(() => { this.refresh(); _sub.unsubscribe(); })
              .subscribe();
          }
          dialogSub.unsubscribe();
        });
      },
      CONFIGURE: (payload: ActionButtonEvent<RowModel>) => {
        this.goToConfig(payload.rowData.scanJob);
      }
    };
  }

  private makeMenu(scanJob: ScanJob): ActionButton<RowModel>[] {
    const menuActionsMap: { [action: string]: ActionButtonHandler<RowModel> } = this.getMenuActionsMap();
    const actionKeys: string[] = ((scan: ScanJob) => {
      switch (scan.opState) {
        case 'Idle':
          if (scan.confState !== 'OK') return ['CLONE', 'DELETE', 'CONFIGURE'];
        case 'Ended':
        case 'Aborted':
        case 'CompletedNOK':
          return ['START', 'CLONE', 'DELETE', 'CONFIGURE'];
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
          return ['CLONE', 'DELETE', 'CONFIGURE'];
      }
    })(scanJob);
    return actionKeys.map(key => {
      const events = new Subject<ActionButtonEvent<RowModel>>();
      events.subscribe(menuActionsMap[key]);
      return { key, title: `DISCOVERY.SCAN_JOBS.ACTIONMENU.${key}`, events };
    });
  }

  private processScanJobsResult(scanJobs: ScanJob[]): void {
    this.table.output$
      .take(1)
      .subscribe((viewModels: ViewModel<RowModel>[]) => {
        scanJobs.forEach((scanJob: ScanJob) => {
          const foundViewModel = viewModels
            .find((iterator: ViewModel<RowModel>) => iterator.row.scanJob.id.join(':') === scanJob.id.join(':'));
          const oldScanJob = (foundViewModel) ? foundViewModel.row.scanJob : null;
          const scanJobOpStateTransitionResult = this.getScanJobOpStateTransitionResult(scanJob, oldScanJob);
          if (!scanJobOpStateTransitionResult) return;
          const foundIndex = this.userOperatedScanJobIds.indexOf(scanJob.id.join(':'));
          if (foundIndex > -1) {
            this.userOperatedScanJobIds.splice(foundIndex, 1);
            const toastrInjectedData: MatSnackBarInjectedData = {
              operationError: false,
              title: this.translate.instant(scanJobOpStateTransitionResult, { scanJobName: scanJob.name })
            };
            setTimeout(() => {
              this.toastrService.show(toastrInjectedData, null);
            }, 1000);
          }
        });
      });
  }

  private poll(): Observable<ScanJobsAPIResult<RowModel>> {
    if (this.linked) {
      const current$: Observable<ScanJobsAPIResult<RowModel>> = this.composeScanJobsResult(
        this.scanJobsService.getScanJobs()
          .do((result: ScanJobsAPIResult<ScanJob>) => {
            this.processScanJobsResult(result.data);
          })
      );
      const next$: Observable<ScanJobsAPIResult<RowModel>> = current$
        .delay(ScanJobsListComponent.pollingInterval)
        .concatMap(() => this.poll());
      return Observable.merge(current$, next$).share();
    } else {
      const searchParams = this.getSearchParams();
      const current$: Observable<ScanJobsAPIResult<RowModel>> = this.composeScanJobsResult(
        this.scanJobsService.getScanJobs(searchParams)
          .do((result: ScanJobsAPIResult<ScanJob>) => {
            this.processScanJobsResult(result.data);
          })
      );
      const next$: Observable<ScanJobsAPIResult<RowModel>> = Observable.race([
        this.interrupt$,
        current$.delay(ScanJobsListComponent.pollingInterval)
      ]).concatMap(() => this.poll());
      return Observable.merge(current$, next$).share();
    }
  }

  private getSearchParams(): ScanJobSearchParams {
    if (!this.table) return { start: 0, limit: 10 };

    const $orderby =
      (this.table.sort.direction &&
        this.table.sort.active + ' ' + this.table.sort.direction) ||
      undefined;

    const $filter =
      (this.table.filter.value !== '' &&
        'name=="*' + this.table.filter.value + '*"') ||
      undefined;

    return {
      $orderby,
      start: this.table.paginator.pageSize * this.table.paginator.pageIndex,
      limit: this.table.paginator.pageSize,
      $filter
    };
  }

  private composeScanJobsResult(
    scanJobs$: Observable<ScanJobsAPIResult<ScanJob>>
  ): Observable<ScanJobsAPIResult<RowModel>> {
    let customCSSClass = '';
    return scanJobs$
      .concatMap((scanJobsResults: ScanJobsAPIResult<ScanJob>) => {
        const data$: Observable<RowModel[]> = Observable.zip(
          ...scanJobsResults.data.map((scanJob: ScanJob) => {
            if (_.isUndefined(scanJob.jobApplianceId)) {
              customCSSClass = (scanJob.isTemporary) ? 'temporary-scan-job' : '';
              return Observable.of(<RowModel>{
                scanJob,
                appliance: undefined,
                customCSSClass
              }).share();
            } else {
              return this.appliancesService
                .getAppliance(scanJob.jobApplianceId.join(':'))
                .map(appliance => {
                  customCSSClass = (scanJob.isTemporary) ? 'temporary-scan-job' : '';
                  return { scanJob, appliance, customCSSClass };
                })
                .share();
            }
          })
        );
        return data$.map((data: RowModel[]) => ({
          data,
          total: scanJobsResults.total
        }));
      })
      .share();
  }

  public refresh(): void {
    this.polling$ = this.poll();
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

  private onRowDoubleClicked(rowIndex: number, row: RowModel, $event): void {
    const id = row.scanJob.id[2];
    this.router.navigate(['../', id], { relativeTo: this.route });
  }

  private onProgressTooltipItemClicked(scanJobId: string): void {
    this.router.navigate([`../${scanJobId}/details`, { openScanLogOfLatestRun: true }], { relativeTo: this.route });
  }

  private goToConfig(scanJob: ScanJob): void {
    const id = scanJob.id.join(':');

    const navigationExtras = {
      queryParams : {
        scanJobId : id
      }
    };

    this.router.navigate(['/main/discovery/sencha'], navigationExtras);
  }

  private goToAddScanJob(): void {
    this.router.navigate(['/main/discovery/sencha', {
      default: 'addScanJob'
    }]);
  }

  @HostListener('window:resize', ['$event']) onResize(event): void {
    if (this.tableResizeTimeoutHandler) {
      clearTimeout(this.tableResizeTimeoutHandler);
      this.tableResizeTimeoutHandler = null;
    }
    this.tableResizeTimeoutHandler = setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
      this.tableResizeTimeoutHandler = null;
    }, 1500);
  }
}

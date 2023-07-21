import {
  Input,
  Output,
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ComponentFactoryResolver,
  ViewChild,
  EventEmitter,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, Subject, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  SyncService,
  GetSyncSystemsIntegrationsAPIResult,
  SyncSystem,
  SyncSystemIntegration,
  newSyncSystemBase,
  WebSocketMessage
} from '../../../services/apis/sync.service';
import { UtilsService } from '../../../services/utils.service';
import {
  TableActionsButtonComponent,
  ActionButton,
  ActionButtonHandler,
  ActionButtonEvent
} from '../../../components/table-actions-button/table-actions-button.component';
import { EffectIconComponent } from '../../../components/effect-icon/effect-icon.component';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  ActionColumn,
  IconColumn,
  RowDefinition,
  PaginationOptions,
  DEFAULT_PAGESIZE_OPTIONS
} from '../../../components/super-table/super-table.component';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { IntegrationModalComponent } from '../../../components/integration-modal/integration-modal.component';
import Utils from '../../../utils';

type RowModel = SyncSystemIntegration;

const emptyResult = { total: 0, data: [] };

@Component({
  selector: 'app-integrations-list',
  templateUrl: './integrations-list.component.html',
  styleUrls: ['./integrations-list.component.less'],
  providers: [SyncService]
})
export class IntegrationsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private static pollingInterval = 15000;

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  errorMessage = null;
  linked = true;
  filtering = true;
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;

  syncWebSocketMessage$: Subject<any>;

  columns: ColumnDefinition<RowModel, any, any>[] = [
    <ColumnDefinition<RowModel, string>>{
      def: 'name',
      header: 'INTEGRATIONS.INTEGRATION_NAME',
      row2cell: (i, row) => row.result.name || '-',
      sort: true
    },
    <IconColumn<RowModel>>{
      def: 'type',
      header: 'INTEGRATIONS.TYPE',
      row2cell: (i, row) => ({
        icon: row.result.type,
        extension: '.png',
        title: ''
      }),
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      sort: (cell => cell.icon || '')
    },
    <ColumnDefinition<RowModel, any>>{
      def: 'status',
      header: 'INTEGRATIONS.STATUS',
      row2cell: (i, row) => (
        {
          status: row.result.sync,
          successFailSummary: row.result.successFailSummary
        }
      ),
      html: true,
      cell: (i, j, cell) => {
        let iconText = null;
        let summaryText = null;
        if (this.isSyncSystemStoppable(cell.status)) {
          iconText = '<span class="icon-success-fail-result icon-success"></span>';
        } else {
          iconText = '<span class="icon-success-fail-result icon-fail"></span>';
        }
        summaryText = `<span>${cell.successFailSummary}</span>`;

        return `${iconText}${summaryText}`;
      },
      sort: (cell: any) => (this.isSyncSystemStoppable(cell.status).toString())
    },
    <ColumnDefinition<RowModel, number>>{
      def: 'lastSuccess',
      header: 'INTEGRATIONS.LAST_SUCCESS',
      row2cell: (i, row) => row.result.lastSuccess,
      cell: (i, j, cell) => {
        if (!cell) return '-';
        const successTime: moment.Moment = moment(cell);
        const now: moment.Moment = moment();
        return moment.duration(now.diff(successTime)).humanize() + ' ago';
      },
      sort: true,
      tooltip: (i, row) => {
        if (!row.result.lastSuccess) return '';
        const tooltipStr = this.translate.instant('INTEGRATIONS.LAST_SUCCESS') + ':\n' +
          this.datePipe.transform(row.result.lastSuccess, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },
    <ColumnDefinition<RowModel, number>>{
      def: 'lastError',
      header: 'INTEGRATIONS.LAST_ERROR',
      row2cell: (i, row) => row.result.lastError,
      cell: (i, j, cell) => {
        if (!cell) return '-';
        const errorTime: moment.Moment = moment(cell);
        const now: moment.Moment = moment();
        return moment.duration(now.diff(errorTime)).humanize() + ' ago';
      },
      sort: true,
      tooltip: (i, row) => {
        if (!row.result.lastError) return '';
        const tooltipStr = this.translate.instant('INTEGRATIONS.LAST_ERROR') + ':\n' +
          this.datePipe.transform(row.result.lastError, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'sync',
      header: 'INTEGRATIONS.SYNC',
      row2cell: (i, row) => row.result.sync || '-',
      sort: true
    },
    <ActionColumn<RowModel>>{
      def: 'actions',
      row2cell: (i, row) => ({
        rowData: row,
        menuItems: this.makeTableActionsMenu(row)
      }),
      header: '',
      cell: this.resolver.resolveComponentFactory(TableActionsButtonComponent)
    }
  ];
  rowDefs: RowDefinition<RowModel>[] = [{
    columns: _.map(this.columns, 'def'),
    onRowClicked: this.onRowClicked.bind(this),
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this)
  }];

  totalRows = 0;
  dataPopulated = false;
  integrationsResult$ = new BehaviorSubject<GetSyncSystemsIntegrationsAPIResult>(emptyResult);
  ngUnsubscribe: Subject<void> = new Subject();
  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    return JSON.stringify(['name', 'type', 'status', 'lastSuccess', 'lastError', 'sync']
      .reduce((agg, key) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private resolver: ComponentFactoryResolver,
    private syncService: SyncService,
    private utilsService: UtilsService
  ) {
    this.refresh = this.refresh.bind(this);
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngOnInit(): void {
    this.syncWebSocketMessage$ = this.syncService.connectSyncWebSocket();
    this.poll(false)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((result: GetSyncSystemsIntegrationsAPIResult) => {
        this.integrationsResult$.next(result);
      });
    this.syncWebSocketMessage$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(message => {
        console.log('WebSocket Message Received: ', message);
        this.updateIntegrationsList(message);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.syncService.disconnectSyncWebSocket();
  }

  refreshIntegrationsList(): void {
    const subscriber = this.poll(true)
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result: GetSyncSystemsIntegrationsAPIResult) => {
        this.integrationsResult$.next(result);
      });
  }

  public isSyncSystemInitable(status: string): boolean {
    return (status !== 'Init starting' && status !== 'WaitingForStartInit' && status !== 'Processing');
  }

  public isSyncSystemStoppable(status: string): boolean {
    return (status !== 'Stopping' && status !== 'Stopped');
  }

  public openAddIntegrationModal(): void {
    const dialogRef = this.dialog.open(IntegrationModalComponent, {
      panelClass: 'integration-modal',
      data: { mode: 'NEW', syncSystem: JSON.parse(JSON.stringify(newSyncSystemBase)), realtimeSync: false }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result) => {
        if (!result) return;
        if (result.needInit) {
          const innerSub = this.syncService.initSyncSystem(result.systemName)
            .finally(() => {
              innerSub.unsubscribe();
            })
            .subscribe(() => {
              this.refreshIntegrationsList();
            });
          return;
        }
        this.refreshIntegrationsList();
      });
  }

  public openEditIntegrationModal(syncSystem: SyncSystem): void {
    const dialogRef = this.dialog.open(IntegrationModalComponent, {
      panelClass: 'integration-modal',
      data: { mode: 'EDIT', syncSystem: syncSystem.syncSystem, realtimeSync: (syncSystem.status === 'Online') ? true : false }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result) => {
        if (!result) return;
        if (result.needInit && this.isSyncSystemInitable(syncSystem.status)) {
          const innerSub = this.syncService.initSyncSystem(result.systemName)
            .finally(() => {
              innerSub.unsubscribe();
            })
            .subscribe(() => {
              this.refreshIntegrationsList();
            });
          return;
        }
        this.refreshIntegrationsList();
      });
  }

  private poll(onetime: boolean = true): Observable<GetSyncSystemsIntegrationsAPIResult> {
    const timeframe = '5d';
    const current$: Observable<GetSyncSystemsIntegrationsAPIResult> = this.syncService.getSyncSystemsIntegrations(timeframe)
      .do((result: GetSyncSystemsIntegrationsAPIResult) => {
        this.dataPopulated = true;
        this.totalRows = result.total;
      });
    const next$: Observable<GetSyncSystemsIntegrationsAPIResult> = current$
      .delay(IntegrationsListComponent.pollingInterval)
      .concatMap(() => this.poll(false));

    return (onetime) ? current$ : Observable.merge(current$, next$);
  }

  private updateIntegrationsList(message: WebSocketMessage) {
    const { systemName, errorCode, timestamp } = message;
    let integrationsListResult = null;
    const subscriber = this.integrationsResult$
      .subscribe((result: GetSyncSystemsIntegrationsAPIResult) => {
        integrationsListResult = result;
        const foundIndex = _.findIndex(
          integrationsListResult.data,
          (iterator: SyncSystemIntegration) => (iterator.result.name === systemName)
        );
        if (foundIndex < 0) return;

        if (errorCode) {
          integrationsListResult.data[foundIndex].syncSystemHealth.lastErrorTimestamp = timestamp;
          integrationsListResult.data[foundIndex].result.lastError = timestamp;
        }
      });
    if (subscriber) subscriber.unsubscribe();
    this.integrationsResult$.next(integrationsListResult);
  }

  private makeTableActionsMenu(row: SyncSystemIntegration): ActionButton<RowModel>[] {
    let dialogRef = null;
    let dialogSub = null;
    const actionKeys: string[] = ['EDIT', 'DELETE'];

    if (this.isSyncSystemStoppable(row.result.sync)) {
      actionKeys.unshift('STOP');
    }
    if (this.isSyncSystemInitable(row.result.sync)) {
      actionKeys.unshift('SYNCNOW');
    }
    if (row.result.type !== 'servicenow') {
      actionKeys.unshift('WIPEOUT');
    }

    const menuActionEventHandler: ActionButtonHandler<RowModel> = (payload: ActionButtonEvent<RowModel>) => {
      const systemName = payload.rowData.result.name;
      const syncSystem = payload.rowData.syncSystem;
      const operation = payload.key;

      switch (operation) {
        case 'SYNCNOW':
          this.syncService.initSyncSystem(systemName)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => (this.refreshIntegrationsList()));
          break;
        case 'STOP':
          this.syncService.stopSyncSystem(systemName)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => (this.refreshIntegrationsList()));
          break;
        case 'EDIT':
          this.openEditIntegrationModal(syncSystem);
          break;
        case 'WIPEOUT':
          dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '450px',
            data: { message: 'INTEGRATIONS.WIPEOUT_CONFIRMATION' }
          });
          dialogSub = dialogRef.afterClosed()
            .finally(() => {
              dialogSub.unsubscribe();
            })
            .subscribe(confirm => {
              if (confirm) {
                this.syncService.wipeSyncSystem(systemName)
                  .takeUntil(this.ngUnsubscribe)
                  .subscribe(() => (this.refreshIntegrationsList()));
              }
            });
          break;
        case 'DELETE':
          dialogRef = this.dialog.open(ConfirmationModalComponent, {
            width: '450px',
            data: { message: 'INTEGRATIONS.DELETE_CONFIRMATION' }
          });
          dialogSub = dialogRef.afterClosed()
            .finally(() => {
              dialogSub.unsubscribe();
            })
            .subscribe(confirm => {
              if (confirm) {
                this.syncService.deleteSyncSystem(systemName)
                  .takeUntil(this.ngUnsubscribe)
                  .subscribe(() => (this.refreshIntegrationsList()));
              }
            });
          break;
        default:
          break;
      }
    };

    return actionKeys.map(key => {
      const events = new Subject<ActionButtonEvent<RowModel>>();
      events.takeUntil(this.ngUnsubscribe).subscribe(menuActionEventHandler);
      return { key, title: `INTEGRATIONS.ACTIONMENU.${key}`, events };
    });
  }

  public refresh(): void {
    this.refreshIntegrationsList();
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
    const systemName = row.result.name;
    this.router.navigate(['../', systemName], { relativeTo: this.activatedRoute });
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

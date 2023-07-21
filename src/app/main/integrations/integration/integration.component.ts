import {
  Component,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
  TemplateRef,
  ComponentFactoryResolver,
  Injectable,
  HostListener
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, RouterStateSnapshot, ActivatedRoute, ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  SyncService,
  SyncSystemIntegration,
  SyncSystemLog,
  Transforms,
  SyncSystemLogSearchParams,
  GetSyncSystemLogsAPIResult,
  WebSocketMessage
} from 'app/services/apis/sync.service';
import { BreadcrumbService } from 'app/services/breadcrumb.service';
import { UtilsService } from '../../../services/utils.service';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  IconColumn,
  ProgressColumn,
  ExpandedRowTemplateInput,
  ExpandedRowContext,
  RowDefinition,
  PaginationOptions,
  DEFAULT_PAGESIZE_OPTIONS
} from 'app/components/super-table/super-table.component';
import { ConfirmationModalComponent } from 'app/components/confirmation-modal/confirmation-modal.component';
import { IntegrationModalComponent } from 'app/components/integration-modal/integration-modal.component';
import { ActionButton, ActionButtonEvent } from '../../../components/table-actions-button/table-actions-button.component';
import { EffectIconComponent } from 'app/components/effect-icon/effect-icon.component';
import Utils from 'app/utils';
import { DateTimeCell, DateTimeToken } from '../../../components/date-time-cell/date-time-cell.component';

interface InfoToken {
  name: string;
  value: string|number;
}

type RowModel = SyncSystemLog;

const emptyResult = { total: 0, data: [] };
const filterComponentTypes = [{ label: 'Node', value: 'Node' }, { label: 'Relation', value: 'Relation' }];
const filterSuccessStates = [{ label: 'Successful', value: 'SUCCESS' }, { label: 'Error', value: 'FAIL' }];

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.less'],
  providers: [SyncService]
})
export class IntegrationComponent implements OnInit, AfterViewInit, OnDestroy {

  private static readonly pollingInterval = 15000;

  filterPanelOpened = false;
  filterApplied = false;
  linked = false;
  filtering = false;
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;

  syncSystemIntegration: SyncSystemIntegration = this.activatedRoute.snapshot.data.syncSystemIntegration;
  infos: InfoToken[] = this.setupInfos();
  menuItems: any[] = this.makeMenu();
  filterSeed = {
    componentTypes: filterComponentTypes,
    successStates: filterSuccessStates
  };
  filter = {
    componentType: null,
    componentName: '',
    successState: null,
    errorMessage: ''
  };
  dirtyFilter = {
    componentType: null,
    componentName: '',
    successState: null,
    errorMessage: ''
  };
  polling$ = new BehaviorSubject<GetSyncSystemLogsAPIResult>(emptyResult);
  private interrupt$: Observable<void> = new Subject<void>();
  private ngUnsubscribe: Subject<void> = new Subject();
  private intervalHandler;

  private syncWebSocketMessage$: Subject<any> = null;
  dataPopulated = false;
  totalRows = 0;

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    return JSON.stringify(['ciType', 'className', 'operation', 'u_correlationid', 'u_name', 'timestamp', 'syncStatus', 'errorInfo']
      .reduce((agg, key) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  rowDefs: RowDefinition<RowModel>[] = [{
    columns: ['ciType', 'className', 'operation', 'u_correlationid', 'u_name', 'timestamp', 'syncStatus', 'errorInfo'],
    onRowClicked: this.onRowClicked.bind(this)
  }];

  columns: ColumnDefinition<RowModel, any, any>[] = [
    <IconColumn<RowModel>>
    {
      def: 'ciType',
      header: 'INTEGRATIONS.TYPE',
      row2cell: (i, row) => ({
        icon: Transforms.syncSystemLogTypeIconTransform(i, row),
        extension: '.svg',
        title: ''
      }),
      cell: this.resolver.resolveComponentFactory(EffectIconComponent),
      sort: false,
      tooltip: (i, row) => {
        const translatedKey = this.translate.instant('INTEGRATIONS.TYPE');
        const typeText = row.result.ciType;

        return `${translatedKey}:\n${typeText}`;
      }
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'className',
      header: 'INTEGRATIONS.COMPONENT_NAME',
      row2cell: (i, row) => row.result.className || '-',
      sort: false
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'operation',
      header: 'INTEGRATIONS.OPERATION',
      row2cell: (i, row) => row.result.operation || '-',
      sort: false
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'u_correlationid',
      header: 'INTEGRATIONS.U_CORRELATIONID',
      row2cell: (i, row) => row.result.mappedCI.u_correlationid || '-',
      sort: false
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'u_name',
      header: 'INTEGRATIONS.U_NAME',
      row2cell: (i, row) => row.result.mappedCI.u_name || '-',
      sort: false
    },

    <ColumnDefinition<RowModel, DateTimeToken, DateTimeCell>>
    {
      def: 'timestamp',
      header: 'INTEGRATIONS.STARTED',
      row2cell: (i, row) => ({ started: row.result.timestamp }),
      cell: this.resolver.resolveComponentFactory(DateTimeCell),
      sort: true,
      tooltip: (i, row) => {
        if (!row.result.timestamp) return '';
        const tooltipStr = this.translate.instant('INTEGRATIONS.STARTED') + ':\n' +
          this.datePipe.transform(row.result.timestamp, 'EEE MMM dd, yyyy HH:mm');
        return tooltipStr;
      }
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'syncStatus',
      header: 'INTEGRATIONS.STATUS',
      row2cell: (i, row) => row.result.syncStatus || '-',
      sort: false
    },

    <ColumnDefinition<RowModel, string>>
    {
      def: 'errorInfo',
      header: 'INTEGRATIONS.STATUS_DETAILS',
      row2cell: (i, row) => row.result.errorInfo || '-',
      sort: false
    }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private syncService: SyncService,
    private resolver: ComponentFactoryResolver,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private breadcrumbService: BreadcrumbService,
    private utilsService: UtilsService,
    private translate: TranslateService
  ) {
    this.refresh = this.refresh.bind(this);
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngOnInit(): void {
    this.syncWebSocketMessage$ = this.syncService.connectSyncWebSocket();
    this.intervalHandler = setInterval(this.refreshSyncSystemIntegration.bind(this), IntegrationComponent.pollingInterval);

    this.dataPopulated = false;
    this.poll(false)
      .takeUntil(this.ngUnsubscribe)
      .catch(() => {
        return Observable.of({ total: 0, data: [] });
      })
      .subscribe((result: GetSyncSystemLogsAPIResult) => {
        this.dataPopulated = true;
        this.totalRows = result.total || result.data.length;
        this.polling$.next(result);
      });

    this.syncWebSocketMessage$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(message => {
        console.log('WebSocket Message Received: ', message);
        this.updateIntegration(message);
      });

    setTimeout(() => {
      this.breadcrumbService.addLabel(this.activatedRoute, this.syncSystemIntegration.result.name);
      Observable.merge
        .apply(null, [
          this.table.sort.sortChange,
          this.table.paginator.page
        ])
        .takeUntil(this.ngUnsubscribe)
        .subscribe(() => {
          (<Subject<void>>this.interrupt$).next();
        });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalHandler);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.syncService.disconnectSyncWebSocket();
  }

  private setupInfos(): InfoToken[] {
    const { syncSystem, syncSystemHealth } = this.syncSystemIntegration;
    const serverUrlText = syncSystem.syncSystem.host || '-';
    const userNameText = syncSystem.syncSystem.login.user || '-';
    const { lastSuccessTimestamp, lastErrorTimestamp } = syncSystemHealth;
    const lastSuccessText = (lastSuccessTimestamp) ? this.datePipe.transform(lastSuccessTimestamp, 'MMM dd, yyyy HH:mm') : '-';
    const lastErrorText = (lastErrorTimestamp) ? this.datePipe.transform(lastErrorTimestamp, 'MMM dd, yyyy HH:mm') : '-';

    return [
      { name: 'INTEGRATIONS.SERVER_URL', value: serverUrlText },
      { name: 'INTEGRATIONS.USERNAME', value: userNameText },
      { name: 'INTEGRATIONS.LAST_SUCCESS', value: lastSuccessText },
      { name: 'INTEGRATIONS.LAST_ERROR', value: lastErrorText }
    ];
  }

  private back(): void {
    this.router.navigate(['..'], {
      relativeTo: this.activatedRoute
    });
  }

  private refreshSyncSystemIntegration(): void {
    const systemName = this.syncSystemIntegration.result.name;
    const timeframe = '5d';

    const sub = this.syncService.getSyncSystemIntegration(systemName, timeframe)
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe((syncSystemIntegration: SyncSystemIntegration) => {
        if (syncSystemIntegration) {
          this.syncSystemIntegration = syncSystemIntegration;
        } else {
          this.back();
        }
      });
  }

  private refreshSyncSystemLogs(navigateToFirstPageOfLogs: boolean = false): void {
    this.dataPopulated = false;
    if (navigateToFirstPageOfLogs) {
      this.table.paginator.pageIndex = 0;
      this.table.paginator.page.next({ pageIndex: 0, pageSize: this.table.paginator.pageSize, length: 0 });
      return;
    }

    const subscriber = this.poll(true)
      .finally(() => {
        subscriber.unsubscribe();
      })
      .catch(() => {
        return Observable.of({ total: 0, data: [] });
      })
      .subscribe((result: GetSyncSystemLogsAPIResult) => {
        this.dataPopulated = true;
        this.totalRows = result.total || result.data.length;
        this.polling$.next(result);
      });
  }

  private poll(onetime: boolean = true): Observable<GetSyncSystemLogsAPIResult> {
    const systemName = this.syncSystemIntegration.result.name;
    const searchParams = this.getSearchParams();
    const current$: Observable<GetSyncSystemLogsAPIResult> = this.syncService.getSyncSystemLogs(systemName, searchParams);
    const next$: Observable<GetSyncSystemLogsAPIResult> = Observable.race([
      this.interrupt$,
      current$.delay(IntegrationComponent.pollingInterval)
    ]).concatMap(() => this.poll(false));

    return (onetime) ? current$ : Observable.merge(current$, next$);
  }

  private getSearchParams(): SyncSystemLogSearchParams {
    if (!this.table || !this.table.paginator) {
      return {
        from: 0,
        pageSize: this.paging.pageSize
      };
    }

    const result: SyncSystemLogSearchParams = {
      from: this.table.paginator.pageSize * this.table.paginator.pageIndex,
      pageSize: this.table.paginator.pageSize,
      orderBy: (this.table.sort.active && this.table.sort.direction) ? this.table.sort.active : undefined,
      orderDir: (this.table.sort.direction) ? this.table.sort.direction.toUpperCase() : undefined,
    };
    const filterQuery = [];

    if (this.filterApplied) {
      if (this.filter.componentType) {
        filterQuery.push(`ciType:${this.filter.componentType}`);
      }
      if (this.filter.componentName) {
        filterQuery.push(`className:*${this.filter.componentName}*`);
      }
      if (this.filter.successState) {
        filterQuery.push(`syncStatus:${this.filter.successState}`);
      }
      if (this.filter.errorMessage) {
        filterQuery.push(`errorInfo:*${this.filter.errorMessage}*`);
      }
      if (filterQuery.length > 0) {
        result.fq = filterQuery.join(',');
      }
    }

    return result;
  }

  private updateIntegration(message: WebSocketMessage) {
    const { status, systemName, errorCode, errorInfo, timestamp } = message;
    this.syncSystemIntegration.syncSystem.status = status;
    this.syncSystemIntegration.result.sync = status;
    if (errorCode) {
      this.syncSystemIntegration.syncSystemHealth.lastErrorTimestamp = timestamp;
      this.syncSystemIntegration.result.lastError = timestamp;
    }
    this.refreshSyncSystemLogs();
  }

  public syncNow(): void {
    const systemName = this.syncSystemIntegration.result.name;
    this.syncService.initSyncSystem(systemName)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.refreshSyncSystemIntegration();
        this.refreshSyncSystemLogs();
      });
  }

  public stopNow(): void {
    const systemName = this.syncSystemIntegration.result.name;
    this.syncService.stopSyncSystem(systemName)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.refreshSyncSystemIntegration();
        this.refreshSyncSystemLogs();
      });
  }

  public isInitable(): boolean {
    const { sync } = this.syncSystemIntegration.result;
    return (sync !== 'Init starting' && sync !== 'WaitingForStartInit' && sync !== 'Processing');
  }

  public isStoppable(): boolean {
    const { sync } = this.syncSystemIntegration.result;
    return (sync !== 'Stopping' && sync !== 'Stopped');
  }

  private editSyncSystem(): void {
    const dialogRef = this.dialog.open(IntegrationModalComponent, {
      panelClass: 'integration-modal',
      data: {
        mode: 'EDIT',
        syncSystem: this.syncSystemIntegration.syncSystem.syncSystem,
        realtimeSync: (this.syncSystemIntegration.result.sync === 'Online') ? true : false
      }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe(result => {
        if (!result) return;
        if (result.needInit && this.isInitable()) {
          const innerSub = this.syncService.initSyncSystem(this.syncSystemIntegration.result.name)
            .finally(() => {
              innerSub.unsubscribe();
            })
            .subscribe(() => {
              this.refreshSyncSystemIntegration();
              this.refreshSyncSystemLogs();
            });
          return;
        }
        this.refreshSyncSystemIntegration();
      });
  }

  private wipeOutSyncSystem(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '450px',
      data: { message: 'INTEGRATIONS.WIPEOUT_CONFIRMATION' }
    });
    const dialogSub = dialogRef.afterClosed()
      .finally(() => {
        dialogSub.unsubscribe();
      })
      .subscribe(confirm => {
        if (confirm) {
          const systemName = this.syncSystemIntegration.result.name;

          const wipeSub = this.syncService.wipeSyncSystem(systemName)
            .finally(() => {
              wipeSub.unsubscribe();
            })
            .subscribe((result: any) => {
              if (!result) return;
              this.refreshSyncSystemIntegration();
              this.refreshSyncSystemLogs();
            });
        }
      });
  }

  private deleteSyncSystem(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '450px',
      data: { message: 'INTEGRATIONS.DELETE_CONFIRMATION' }
    });
    const dialogSub = dialogRef.afterClosed()
      .finally(() => {
        dialogSub.unsubscribe();
      })
      .subscribe(confirm => {
        if (confirm) {
          const systemName = this.syncSystemIntegration.result.name;

          const deleteSub = this.syncService.deleteSyncSystem(systemName)
            .finally(() => {
              deleteSub.unsubscribe();
            })
            .subscribe((result: any) => {
              if (!result) return;
              this.back();
            });
        }
      });
  }

  private makeMenu(): ActionButton<SyncSystemIntegration>[] {
    const menuActionsMap = {
      STOP: this.stopNow,
      EDIT: this.editSyncSystem,
      WIPEOUT: this.wipeOutSyncSystem,
      DELETE: this.deleteSyncSystem
    };

    const actionKeys = ['EDIT', 'DELETE'];
    if (this.isStoppable()) {
      actionKeys.unshift('STOP');
    }
    if (this.syncSystemIntegration.result.type !== 'servicenow') {
      actionKeys.unshift('WIPEOUT');
    }

    return actionKeys.map(key => {
      const events = new Subject<ActionButtonEvent<SyncSystemIntegration>>();

      events.subscribe(menuActionsMap[key].bind(this));

      return {
        events,
        key,
        title: `INTEGRATIONS.ACTIONMENU.${key}`
      };
    });
  }

  public toggleFilterPanel(): void {
    this.dirtyFilter = { ...this.filter };
    this.filterPanelOpened = !this.filterPanelOpened;
  }

  public clearFilter(): void {
    this.filter = {
      componentType: null,
      componentName: '',
      successState: null,
      errorMessage: ''
    };
    this.dirtyFilter = { ...this.filter };
    this.filterApplied = false;
    this.refreshSyncSystemLogs(true);
  }

  public applyFilter(): void {
    this.filter = { ...this.dirtyFilter };
    this.filterApplied = true;
    this.refreshSyncSystemLogs(true);
  }

  public getFilterDirtiness(): boolean {
    return !(_.isEqual(this.filter, this.dirtyFilter));
  }

  public refresh(): void {
    this.refreshSyncSystemLogs();
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

@Injectable()
export class SyncSystemIntegrationResolver implements Resolve<SyncSystemIntegration> {
  constructor(private syncService: SyncService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SyncSystemIntegration> {
    const systemName = route.paramMap.get('systemName');
    const timeframe = '5d';

    return this.syncService.getSyncSystemIntegration(systemName, timeframe)
      .map((syncSystemIntegration: SyncSystemIntegration) => {
        if (syncSystemIntegration) {
          return syncSystemIntegration;
        } else {
          this.router.navigate(['../']);
          return null;
        }
      }).share();
  }
}

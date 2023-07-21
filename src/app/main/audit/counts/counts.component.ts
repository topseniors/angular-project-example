import { Component, ViewChild, OnInit, AfterViewInit, OnDestroy, ComponentFactoryResolver, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatInput } from '@angular/material';
import { AuditService } from '../../../services/audit.service';
import { UtilsService } from '../../../services/utils.service';
import { EffectIconComponent } from '../../../components/effect-icon/effect-icon.component';
import { Transforms } from '../../../services/apis/search.service';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  IconColumn,
  RowDefinition,
  PaginationOptions,
  DEFAULT_PAGESIZE_OPTIONS
} from '../../../components/super-table/super-table.component';
import Utils from '../../../utils';

const STATUS_OK = 'OK';
const STATUS_NOT_OK = 'NotOK';
const TABLE_VIEW = 'TableView';
const GRID_VIEW = 'GridView';

interface CountsRow {
  className: string;
  status: string;
  OrientDB: number;
  ES: number;
  InternalState: number;
}

type RowModel = CountsRow;

@Component({
  selector: 'app-counts',
  templateUrl: './counts.component.html',
  styleUrls: ['./counts.component.less']
})
export class CountsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatInput) filter: MatInput;
  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  gridRows = null;
  viewMode = {
    currentMode: TABLE_VIEW,
    tableView: TABLE_VIEW,
    gridView: GRID_VIEW
  };
  linked = true;
  filtering = true;
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public filterInputVisible = false;
  public gridRowsTooMany = false;
  private connectionStatusSubscription;

  columns: ColumnDefinition<RowModel, any, any>[] = [
    <IconColumn<RowModel>>
    {
      def: 'ciType',
      header: '',
      row2cell: (i, row) => ({
        extension: '.svg',
        icon: Transforms.entityTypeIconTransform(i, row),
        title: ''
      }),
      cell: this.resolver.resolveComponentFactory(EffectIconComponent)
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'className',
      header: 'AUDIT.COUNTS.CLASS_NAME',
      row2cell: (i, row) => row.className || '-',
      sort: true
    },
    <ColumnDefinition<RowModel, any>>{
      def: 'internalState',
      header: 'AUDIT.COUNTS.INTERNAL_STATE',
      row2cell: (i, row) => ({
        value: row.InternalState,
        label: this.utilsService.getMinimizedNumberFormat(row.InternalState)
      }),
      cell: (i, j, cell) => cell.label,
      sort: (cell: any) => cell.value
    },
    <ColumnDefinition<RowModel, any>>{
      def: 'orientDB',
      header: 'AUDIT.COUNTS.ORIENT_DB',
      row2cell: (i, row) => ({
        value: row.OrientDB,
        label: this.utilsService.getMinimizedNumberFormat(row.OrientDB)
      }),
      cell: (i, j, cell) => cell.label,
      sort: (cell: any) => cell.value
    },
    <ColumnDefinition<RowModel, any>>{
      def: 'elasticSearch',
      header: 'AUDIT.COUNTS.ELASTIC_SEARCH',
      row2cell: (i, row) => ({
        value: row.ES,
        label: this.utilsService.getMinimizedNumberFormat(row.ES)
      }),
      cell: (i, j, cell) => cell.label,
      sort: (cell: any) => cell.value
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'status',
      header: 'AUDIT.COUNTS.STATUS',
      row2cell: (i, row) => row.status || '-',
      sort: true
    }
  ];
  rowDefs: RowDefinition<RowModel>[] = [{
    columns: ['ciType', 'className', 'internalState', 'orientDB', 'elasticSearch', 'status']
  }];
  totalRows = 0;
  dataPopulated = false;
  rows = [];
  countsResult$ = this.getCounts();

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    return JSON.stringify(['className', 'internalState', 'orientDB', 'elasticSearch', 'status']
      .reduce((agg, key) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private utilsService: UtilsService,
    private auditService: AuditService
  ) {
    this.refreshCounts = this.refreshCounts.bind(this);
    this.rowDefs[0].onRowClicked = this.onRowClicked.bind(this);
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngOnInit(): void {
    this.refreshCounts();
    this.connectionStatusSubscription = this.auditService.isAuditCountConnected$
      .subscribe(connected => {
        if (connected) {
          this.refreshCounts();
        }
      });

    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe((params: Params) => {
        const { viewMode } = params;
        const { tableView, gridView } = this.viewMode;
        if (viewMode === tableView || viewMode === gridView) {
          this.viewMode.currentMode = viewMode;
          if (viewMode === tableView) {
            this.adjustTable();
          } else {
            const subscriber = this.countsResult$
              .finally(() => subscriber.unsubscribe())
              .subscribe();
          }
        } else {
          this.viewMode.currentMode = tableView;
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.viewMode.currentMode === this.viewMode.tableView) {
      this.adjustTable();
    }
    this.filter.stateChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.composeGridRows();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.connectionStatusSubscription.unsubscribe();
  }

  private adjustTable(): void {
    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
      this.table.sort.sort({ id: 'className', start: 'asc', disableClear: false });
    });
  }

  private updateRow(className, value, source) {
    let foundIndex = -1;
    foundIndex = this.rows.findIndex(row => row.className === className);
    if (foundIndex > -1) {
      this.rows[foundIndex][source] = value;
      return;
    }

    const row = { className, OrientDB: 0, ES: 0, InternalState: 0, status: null };
    row[source] = value;
    this.rows.push(row);
  }

  private updateRowsStatus() {
    this.rows.forEach(row => {
      if (row.OrientDB === row.InternalState && row.OrientDB === row.ES) {
        row.status = STATUS_OK;
      } else {
        row.status = STATUS_NOT_OK;
      }
    });
  }

  private composeGridRows(): void {
    let tempRows = this.rows
      .slice()
      .map(rowIterator => ({
        ...rowIterator,
        OrientDB: this.utilsService.getMinimizedNumberFormat(rowIterator.OrientDB),
        ES: this.utilsService.getMinimizedNumberFormat(rowIterator.ES),
        InternalState: this.utilsService.getMinimizedNumberFormat(rowIterator.InternalState)
      }));
    if (this.filter && this.filter.value !== '') {
      tempRows = tempRows.filter((tempRow) => {
        let stringified = '';
        try { stringified += JSON.stringify(tempRow); } catch (e) { }
        return (stringified.toLowerCase()).indexOf(this.filter.value.toLowerCase()) > -1;
      });
    }

    let gridRowsCount = Math.ceil(tempRows.length / 8);
    const gridColsCount = 8;
    if (gridRowsCount > 100) {
      gridRowsCount = 100;
      this.gridRowsTooMany = true;
    } else {
      this.gridRowsTooMany = false;
    }
    let rowCells = null;
    this.gridRows = [];
    for (let i = 0; i < gridRowsCount; i++) {
      rowCells = tempRows.slice(i * gridColsCount, i * gridColsCount + gridColsCount);
      rowCells = rowCells.map(rowCell => ({ ...rowCell, selected: false }));
      this.gridRows.push(rowCells);
    }
    for (let j = 0; j < gridRowsCount * gridColsCount - tempRows.length; j++) {
      this.gridRows[gridRowsCount - 1].push({ selected: false, empty: true });
    }
  }

  private getCounts() {
    return this.auditService.countStream
      .map(counts => {
        if (counts && counts.tenantId) {
          for (const key in counts.counters) {
            if (counts.counters.hasOwnProperty(key)) {
              this.updateRow(key, counts.counters[key], counts.source);
            }
          }
          this.updateRowsStatus();
          this.dataPopulated = true;
          this.totalRows = this.rows.length;
          this.composeGridRows();
        }

        return {
          total: this.totalRows,
          data: this.rows
        };
      });
  }

  public refreshCounts(): void {
    this.auditService.refreshCounts();
  }

  public toggleFilterInput(): void {
    this.filterInputVisible = !this.filterInputVisible;
    if (this.filterInputVisible) {
      setTimeout(() => {
        this.filter.focus();
      });
    }
  }

  public clearFilterText(): void {
    this.filter.value = '';
  }

  public setViewMode(mode): void {
    this.router.navigate(['/main/audit/counts', {
      viewMode: mode
    }]);
  }

  public selectGridCell(gridCell): void {
    this.gridRows.forEach((gridRow) => {
      gridRow.forEach((gridCellIterator) => {
        gridCellIterator.selected = false;
      });
    });
    if (gridCell.empty) {
      return;
    }
    gridCell.selected = true;
  }

  public onRowClicked(rowIndex: number, row: RowModel, $event): void {
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
    if (this.viewMode.currentMode !== this.viewMode.tableView) {
      return;
    }
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

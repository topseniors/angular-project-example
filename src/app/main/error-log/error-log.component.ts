import { Component, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { ErrorService, ErrorLogResult, ErrorEntry } from '../../services/error.service';
import { UtilsService } from '../../services/utils.service';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  RowDefinition,
  PaginationOptions,
  DEFAULT_PAGESIZE_OPTIONS
} from '../../components/super-table/super-table.component';
import Utils from '../../utils';

type RowModel = ErrorEntry;
const envPath = environment.envPath;

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.less']
})
export class ErrorLogComponent implements AfterViewInit {

  private static readonly pollingInterval = 15000;

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  errorMessage = null;
  linked = true;
  filtering = true;
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;
  columns: ColumnDefinition<RowModel, any, any>[] = [
    <ColumnDefinition<RowModel, number>>{
      def: 'date',
      header: 'ERROR_LOG.DATE',
      row2cell: (i, row) => row.timestamp || 0,
      html: true,
      cell: (i, j, cell) => {
        if (!cell) return '-';
        const dateString = this.datePipe.transform(cell, 'MMM dd, yyyy');
        const timeString = this.datePipe.transform(cell, 'HH:mm:ss');
        return `${dateString} <span class="time">${timeString}</span>`;
      },
      sort: true
    },

    <ColumnDefinition<RowModel, number>>{
      def: 'numberOfOccurrences',
      header: 'ERROR_LOG.NUMBER_OF_OCCURRENCES',
      row2cell: (i, row) => row.numberOfOccurrences || '-',
      sort: true
    },

    <ColumnDefinition<RowModel, string>>{
      def: 'url',
      header: 'ERROR_LOG.URL',
      row2cell: (i, row) => row.url,
      html: true,
      cell: (i, j, cell) => {
        if (!cell) return '-';
        if (cell.indexOf(envPath) < 0) return cell;
        const formatted = cell.replace(envPath, `<span class="env-path">${envPath}</span>`);
        return formatted;
      },
      sort: true,
      tooltip: (i, row) => row.url
    },

    <ColumnDefinition<RowModel, number>>{
      def: 'debugCode',
      header: 'ERROR_LOG.DEBUG_CODE',
      row2cell: (i, row) => row.status || '-',
      tooltip: (i, row) => row.statusDescription,
      sort: true
    }
  ];
  rowDefs: RowDefinition<RowModel>[] = [{
    columns: ['date', 'numberOfOccurrences', 'url', 'debugCode']
  }];
  totalRows = 0;
  dataPopulated = false;
  errorLogResult$ = this.getErrorLog();

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    return JSON.stringify(['date', 'numberOfOccurrences', 'url', 'debugCode']
      .reduce((agg, key) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  constructor(
    private datePipe: DatePipe,
    private errorService: ErrorService,
    private utilsService: UtilsService
  ) {
    this.refresh = this.refresh.bind(this);
    this.rowDefs[0].onRowClicked = this.onRowClicked.bind(this);
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
      this.table.sort.sort({ id: 'date', start: 'desc', disableClear: false });
    });
  }

  getErrorLog(): Observable<ErrorLogResult> {
    const current$: Observable<ErrorLogResult> = this.errorService.getAll()
      .catch((err: any) => {
        this.dataPopulated = false;
        this.errorMessage = err.message;
        return Observable.of({ total: 0, data: [] });
      })
      .do((result: ErrorLogResult) => {
        this.totalRows = result.total;
        this.dataPopulated = true;
        this.errorMessage = null;
      });
    const next$: Observable<ErrorLogResult> = current$
      .delay(ErrorLogComponent.pollingInterval)
      .concatMap(() => this.getErrorLog());
    return Observable.merge(current$, next$).share();
  }

  clearErrorLog(): void {
    this.errorService.flush()
      .do((result: ErrorLogResult) => {
        this.totalRows = result.total;
        this.dataPopulated = true;
        this.errorMessage = null;
      });
  }

  public refresh(): void {
    this.errorLogResult$ = this.getErrorLog();
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

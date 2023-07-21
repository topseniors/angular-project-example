import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ContentChildren,
  QueryList,
  ComponentFactoryResolver
} from '@angular/core';
import { MatCheckbox, MatCheckboxChange, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import * as _ from 'lodash';
import 'rxjs/add/operator/takeUntil';
import {
  SearchService,
  Folder,
  Search,
  APIResult,
  SaveSearchPayload,
  SaveFolderPayload,
  SEARCH_MODE_REGULAR
} from '../../../services/apis/search.service';
import { EntityTypes } from '../../../config/search.config';
import { MatSnackBarInjectedData } from '../../../components/notification/notification.component';
import { ToastrService } from '../../../services/toastr.service';
import {
  SuperTableComponent,
  ColumnDefinition,
  RowTransform,
  ViewModel,
  RowDefinition
} from '../../../components/super-table/super-table.component';
import { FolderModalComponent } from '../../../components/folder-modal/folder-modal.component';
import { EditSearchModalComponent } from '../../../components/edit-search-modal/edit-search-modal.component';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import Utils from '../../../utils';

type RowModel = Search;

@Component({
  selector: 'app-manage-saved-searches',
  templateUrl: './manage-saved-searches.component.html',
  styleUrls: ['./manage-saved-searches.component.less']
})
export class ManageSavedSearchesComponent implements OnInit, AfterViewInit, OnDestroy {

  private static pollingInterval = 150000;

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;
  @ContentChildren('/deep/mat-checkbox', { descendants: true }) checkboxes: QueryList<MatCheckbox>;

  intervalHandler = null;

  folders: Folder[] = [];
  selectedFolder: Folder = null;
  newFolder: SaveFolderPayload = { data: { name: '', shortDescr: '', type: 'Search', mode: 'NEW' } };
  editedFolder: SaveFolderPayload = { data: { id: '', name: '', shortDescr: '', mode: 'EDIT' } };

  selectedFolderSearches$ = new Subject<APIResult<Search>>();
  selectedSearches: string[] = [];
  editedSearch: SaveSearchPayload = { data: { id: '', entity: '', folderId: '', name: '', q: '', shortDescr: '' } };

  private _tickAllHeaderSub: Subscription;
  private _tickClearOperationAnySub: Subscription;
  private _tickAllChangeSub: any = {};
  private _tickAnyCellSub: any = {};
  private _interruptSub: Subscription;

  private clearSelection$ = new Subject<void>();
  private operationDone$ = new Subject<void>();
  private tickAll$ = new Subject<boolean>();
  private tickAny$ = new Subject<any>();

  errorMessage = null;
  linked = true;
  filtering = false;
  paging = { pageSize: 10, pageSizeOptions: [10, 15, 20, 50, 100] };

  columns: ColumnDefinition<RowModel, any, any>[] = [
    <ColumnDefinition<Search, void>>
    {
      def: 'tickbox',
      header: this.resolver.resolveComponentFactory(MatCheckbox),
      headerContext: (cell: MatCheckbox) => {
        this._tickAllHeaderSub = cell.change.subscribe((event: MatCheckboxChange) => {
          this.tickAll$.next(event.checked);
        });
        setTimeout(() => {
          this._tickClearOperationAnySub = Observable.merge(
            this.clearSelection$,
            this.operationDone$,
            this.tickAny$
          ).subscribe(() => {
            cell.checked = false;
          });
        });
      },
      headerCssClass: '',
      row2cell: (i, row) => ((cell: MatCheckbox) => {
        let subIterator: Subscription = this._tickAllChangeSub[row.id];
        if (subIterator) {
          subIterator.unsubscribe();
        }
        this._tickAllChangeSub[row.id] = this.tickAll$.subscribe((checked: boolean) => {
          if (cell.checked === checked) return;
          cell.checked = checked;
          this.processTickedSearch(checked, row);
        });

        subIterator = this._tickAnyCellSub[row.id];
        if (subIterator) {
          subIterator.unsubscribe();
        }
        this._tickAnyCellSub[row.id] = cell.change.subscribe((event: MatCheckboxChange) => {
          this.tickAny$.next();
          this.processTickedSearch(event.checked, row);
        });
      }),
      cell: this.resolver.resolveComponentFactory(MatCheckbox),
      cssClass: (i, row) => ((row.folderName === 'System Searches') ? 'invisible-no-action' : '')
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'entityType',
      header: 'SEARCH.MANAGE_SAVED_SEARCHES.ENTITY_TYPE',
      row2cell: (i, row) => {
        const searchEntityType = row.entity;
        const foundSearchEntityType = EntityTypes.find(iterator => iterator.value === searchEntityType);
        if (!foundSearchEntityType) {
          return searchEntityType || '-';
        }
        const entityTypeLabel = this.translate.instant(foundSearchEntityType.label);
        const extendITUSuffix = foundSearchEntityType.extendITU ? this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.ITU_EXTEND') : '';
        return `${entityTypeLabel}${extendITUSuffix}`;
      },
      sort: false,
      tooltip: (i, row) =>
        row.q ?
          `${this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.QUERY_LABEL_PREFIX')}${row.q}`
          : this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.NO_QUERY_LABEL')
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'searchName',
      header: 'SEARCH.MANAGE_SAVED_SEARCHES.SEARCH_NAME',
      row2cell: (i, row) => row.name || '-',
      sort: false,
      tooltip: (i, row) =>
        row.q ?
          `${this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.QUERY_LABEL_PREFIX')}${row.q}`
          : this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.NO_QUERY_LABEL')
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'searchDescription',
      header: 'SEARCH.MANAGE_SAVED_SEARCHES.SEARCH_DESCRIPTION',
      row2cell: (i, row) => row.shortDescr || '-',
      sort: false,
      tooltip: (i, row) =>
        row.q ?
          `${this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.QUERY_LABEL_PREFIX')}${row.q}`
          : this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.NO_QUERY_LABEL')
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'createdBy',
      header: 'SEARCH.MANAGE_SAVED_SEARCHES.CREATED_BY',
      row2cell: (i, row) => row.createdByName || '-',
      sort: false,
      tooltip: (i, row) =>
        row.q ?
          `${this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.QUERY_LABEL_PREFIX')}${row.q}`
          : this.translate.instant('SEARCH.MANAGE_SAVED_SEARCHES.NO_QUERY_LABEL')
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'edit',
      header: '',
      row2cell: (i, row) => `<i class="fa fa-pencil" attr.data-testid="edit-${i}"></i>`,
      html: true,
      sort: false,
      cssClass: (i, row) => ((row.folderName === 'System Searches') ? 'invisible-no-action' : ''),
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.setEditedSearch(viewModel.row);
      }
    },
    <ColumnDefinition<RowModel, string>>{
      def: 'delete',
      header: '',
      row2cell: (i, row) => `<i class="fa fa-trash" attr.data-testid="remove-${i}"></i>`,
      html: true,
      sort: false,
      cssClass: (i, row) => ((row.folderName === 'System Searches') ? 'invisible-no-action' : ''),
      onCellClicked: (i, j, viewModel, event) => {
        event.stopPropagation();

        this.deleteSearch(viewModel.row.id);
      }
    }
  ];
  rowDefs: RowDefinition<RowModel>[] = [{
    columns: _.map(this.columns, 'def')
  }];
  totalRows = 0;
  dataPopulated = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  trackBy: RowTransform<ViewModel<RowModel>, string> = (i, viewModel) => {
    return JSON.stringify(['id', 'searchName', 'searchDescription', 'createdBy']
      .reduce((agg, key) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private searchService: SearchService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private resolver: ComponentFactoryResolver
  ) {
    this.refresh = this.refresh.bind(this);
    this.rowDefs[0].onRowClicked = this.onRowClicked.bind(this);
    this.rowDefs[0].onRowDoubleClicked = this.onRowDoubleClicked.bind(this);
  }

  ngOnInit(): void {
    this.getFolders();
    if (this.intervalHandler) {
      clearInterval(this.intervalHandler);
    }
    this.intervalHandler = setInterval(this.getFolders.bind(this), ManageSavedSearchesComponent.pollingInterval);
  }

  ngAfterViewInit(): void {
    this._interruptSub = this.table.interrupt.subscribe(() => {
      _.forEach(this._tickAllChangeSub, (value, key) => this._tickAllChangeSub[key].unsubscribe());
      _.forEach(this._tickAnyCellSub, (value, key) => this._tickAnyCellSub[key].unsubscribe());
      this.clearSearchesSelection();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    clearInterval(this.intervalHandler);

    if (this._tickAllHeaderSub) {
      this._tickAllHeaderSub.unsubscribe();
    }
    if (this._tickClearOperationAnySub) {
      this._tickClearOperationAnySub.unsubscribe();
    }

    this._interruptSub.unsubscribe();
    _.forEach(this._tickAllChangeSub, (value, key) => this._tickAllChangeSub[key].unsubscribe());
    _.forEach(this._tickAnyCellSub, (value, key) => this._tickAnyCellSub[key].unsubscribe());
  }

  goBack(): void {
    this.router.navigate(['../do-search'], {
      relativeTo: this.activatedRoute
    });
  }

  getFolders(): void {
    const sub = this.searchService.getFoldersWithTree()
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe((result: Folder[]) => {
        result = result.sort((a: Folder, b: Folder) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
        let foundIndex = -1;
        if (this.selectedFolder) {
          foundIndex = result.findIndex((folderIterator: Folder) => (folderIterator.id === this.selectedFolder.id));
        }
        if (foundIndex < 0) {
          foundIndex = 0;
        }
        this.folders = result;
        this.selectFolder(this.folders[foundIndex]);
      });
  }

  isDefaultSavedFolder(folder: Folder): boolean {
    return (folder.name === 'System Searches');
  }

  openAddFolderModal(): void {
    const dialogRef = this.dialog.open(FolderModalComponent, {
      width: '400px',
      panelClass: 'folder-modal',
      data: { ...this.newFolder.data }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result) => {
        if (result) {
          this.newFolder.data.name = '';
          this.newFolder.data.shortDescr = '';
          this.getFolders();
        }
      });
  }

  setEditedFolder(folder: Folder): void {
    this.editedFolder = {
      data: {
        ...this.editedFolder.data,
        id: folder.id,
        name: folder.name,
        shortDescr: folder.shortDescr
      }
    };

    const dialogRef = this.dialog.open(FolderModalComponent, {
      width: '400px',
      panelClass: 'folder-modal',
      data: { ...this.editedFolder.data }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result) => {
        if (result) {
          this.getFolders();
        }
      });
  }

  selectFolder(folder: Folder): void {
    const needRefresh = !(this.selectedFolder && this.selectedFolder.id === folder.id);
    this.folders.forEach((folderIterator: Folder) => (folderIterator.active = false));
    folder.active = true;
    this.selectedFolder = folder;
    this.columns[0].headerCssClass = (!this.selectedFolder || this.selectedFolder.name === 'System Searches') ? 'invisible-no-action' : '';
    this.getSelectedFolderSearches(needRefresh);
  }

  deleteFolder(folder: Folder): void {
    if (folder.dsRefs.length > 0) {
      const toastrInjectedData: MatSnackBarInjectedData = {
        operationError: true,
        title: 'SEARCH.MANAGE_SAVED_SEARCHES.DELETE_FOLDER_WITH_CONTENT_NO'
      };

      this.toastrService.show(toastrInjectedData, null);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: { message: 'SEARCH.MANAGE_SAVED_SEARCHES.DELETE_FOLDER_CONFIRMATION' }
    });

    const dialogSub = dialogRef.afterClosed()
      .finally(() => {
        dialogSub.unsubscribe();
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.searchService.deleteFolder(folder.id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => {
              if (this.selectedFolder.id === folder.id) {
                this.selectedFolder = null;
              }
              this.getFolders();
            });
        }
      });
  }

  getSelectedFolderSearches(needRefresh: boolean = false): void {
    this.dataPopulated = false;
    this.totalRows = 0;
    const sub = this.poll()
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe(result => {
        if (needRefresh) {
          this.selectedFolderSearches$.next();
          this.clearSelection$.next();
          this.selectedSearches = [];
          this.table.paginator.page.next({ pageIndex: 0, pageSize: this.table.paginator.pageSize, length: 0 });
          this.table.paginator.pageIndex = 0;
          _.forEach(this._tickAllChangeSub, (value, key) => this._tickAllChangeSub[key].unsubscribe());
          _.forEach(this._tickAnyCellSub, (value, key) => this._tickAnyCellSub[key].unsubscribe());
        }
        result.data.sort((a: Search, b: Search) => {
          const first = a.name || a.id;
          const second = b.name || b.id;
          if (first.toLowerCase() < second.toLowerCase()) return -1;
          if (first.toLowerCase() > second.toLowerCase()) return 1;
          return 0;
        });
        this.selectedFolderSearches$.next({ ...result, total: result.data.length });
        this.dataPopulated = true;
        this.totalRows = result.data.length;
      });
  }

  poll(): Observable<APIResult<RowModel>> {
    return this.searchService.getFolderSearches(this.selectedFolder.id);
  }

  processTickedSearch(checked: boolean, row: Search): void {
    if (checked) {
      this.selectedSearches.push(row.id);
      return;
    }
    _.remove(this.selectedSearches, (iterator: string) => (iterator === row.id));
  }

  clearSearchesSelection(): void {
    this.clearSelection$.next();
    this.tickAll$.next(false);
    this.selectedSearches = [];
  }

  deleteSearches(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: { message: 'SEARCH.MANAGE_SAVED_SEARCHES.DELETE_SEARCHES_CONFIRMATION' }
    });

    const dialogSub = dialogRef.afterClosed()
      .finally(() => {
        dialogSub.unsubscribe();
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.searchService.deleteSearches(this.selectedSearches)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => {
              this.getSelectedFolderSearches(true);
            });
        }
      });
  }

  deleteSearch(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: { message: 'SEARCH.MANAGE_SAVED_SEARCHES.DELETE_SEARCH_CONFIRMATION' }
    });

    const dialogSub = dialogRef.afterClosed()
      .finally(() => {
        dialogSub.unsubscribe();
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.searchService.deleteSearch(id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => {
              this.getSelectedFolderSearches(true);
              _.remove(this.selectedFolder.dsRefs, (iterator: string) => (iterator === id));
            });
        }
      });
  }

  setEditedSearch(search: Search): void {
    this.editedSearch = {
      data: {
        id: search.id,
        entity: search.entity,
        folderId: search.folderId,
        name: search.name,
        q: search.q,
        shortDescr: search.shortDescr
      }
    };
    const dialogRef = this.dialog.open(EditSearchModalComponent, {
      width: '400px',
      panelClass: 'edit-search-modal',
      data: { ...this.editedSearch.data }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result) => {
        if (result) {
          this.getSelectedFolderSearches(true);
        }
      });
  }

  refresh(): void {
    this.getSelectedFolderSearches(true);
  }

  onRowClicked(rowIndex: number, row: RowModel, $event): void {
    if ($event.target.classList.contains('mat-checkbox-inner-container')) {
      return;
    }

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

  onRowDoubleClicked(rowIndex: number, row: RowModel, $event): void {
    if ($event.target.classList.contains('mat-checkbox-inner-container')) {
      return;
    }
    const entityType = row.entity;
    const searchString = row.q;
    const searchMode = row.searchMode || SEARCH_MODE_REGULAR;
    this.router.navigate(['../do-search', { entityType, searchString, searchMode }], { relativeTo: this.activatedRoute });
  }
}

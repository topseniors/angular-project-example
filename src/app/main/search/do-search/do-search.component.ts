import {
  Component,
  ComponentFactoryResolver,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CodemirrorService } from '@nomadreservations/ngx-codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/markdown/markdown';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';
import {
  SearchService,
  SearchAPIResult,
  CI,
  CIWrapper,
  Transforms,
  StringableCollection,
  SEARCH_MODE_REGULAR,
  SEARCH_MODE_DSL
} from '../../../services/apis/search.service';
import {
  MetamodelService
} from '../../../services/apis/metamodel.service';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { UtilsService } from '../../../services/utils.service';
import { MenuService } from 'app/services/apis/menu.service';
import { SaveSearchModalComponent } from '../../../components/save-search-modal/save-search-modal.component';
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
import { SearchConfiguration, SearchTypes, EntityTypes } from '../../../config/search.config';
import * as _ from 'lodash';
import * as moment from 'moment';
import Utils from '../../../utils';

const CodeMirror = require('codemirror');

interface RowModel { ci: CI; }
interface FacetItem { label: string; originalLabel: string; value: string; visible: boolean; }
interface Facet { placeholder: string; name: string; selectedValue: string; items: FacetItem[]; }
interface ImportedFacet { field: string; header: string; values: any; }
interface ActionParam { param: string; field: any; value: any; }

class DoSearchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-do-search',
  templateUrl: './do-search.component.html',
  styleUrls: ['./do-search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoSearchComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(SuperTableComponent) table: SuperTableComponent<RowModel>;

  private iquateCIKeywordsList: string[] = [];
  private iquateCIAttributeKeywordsList: string[] = [];
  private iquateKeywords = [];
  dslSearchCodeMirrorConfig = {
    mode: {
      name: 'text/x-markdown'
    },
    tabSize: 2,
    lineWrapping: true,
    hintOptions: { hint: this.getDSLHintKeywords.bind(this) }
  };
  dslSearchCodeMirrorEditor = null;
  dslSearchCodeMirrorFocused = false;
  errorMessage = null;
  linked = false;
  filtering = false;
  paging: PaginationOptions;
  tableResizeTimeoutHandler: any;
  columns: ColumnDefinition<RowModel, any, any>[] = [];
  rowDefs: RowDefinition<RowModel>[] = [{
    columns: [],
    onRowDoubleClicked: null,
    tooltip: ''
  }];
  totalRows = 0;
  dataPopulated = false;
  entityTypeDataLoading = false;
  withHighlight = false;
  searchResult$ = new BehaviorSubject<SearchAPIResult<RowModel>>({ total: 0, data: [] });

  SEARCH_MODE_REGULAR = SEARCH_MODE_REGULAR;
  SEARCH_MODE_DSL = SEARCH_MODE_DSL;
  searchMode = SEARCH_MODE_REGULAR;
  searchInputCtrl: FormControl = new FormControl('', [Validators.maxLength(512)]);
  searchKeywords$: Observable<string[]>;
  facets: Facet[] = [];
  searchString = '';
  searchTypes: any[] = SearchTypes;
  searchType: string = this.searchTypes[0].value;
  entityTypes: any[] = EntityTypes;
  entityType: string;
  entityTypeIndex: number;
  displayedEntityTypeTabItems: any[] = [];
  collapsedEntityTypeTabItems: any[] = [];

  matcher = new DoSearchErrorStateMatcher();

  private entityConfigInstance: any;
  private timeoutHandler: any = null;
  private ngUnsubscribe: Subject<void> = new Subject();

  trackBy: RowTransform<ViewModel<RowModel>, string>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private resolver: ComponentFactoryResolver,
    private searchService: SearchService,
    private metamodelService: MetamodelService,
    private codeMirrorService: CodemirrorService,
    private breadcrumbService: BreadcrumbService,
    private utilsService: UtilsService,
    private menuService: MenuService,
    private translate: TranslateService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.setupAutoCompleteControl();
    this.refresh = this.refresh.bind(this);
    this.rowDefs[0].onRowClicked = this.onRowClicked.bind(this);
    this.rowDefs[0].onRowDoubleClicked = this.onRowDoubleClicked.bind(this);
    this.paging = { pageSize: 15, pageSizeOptions: DEFAULT_PAGESIZE_OPTIONS };
  }

  ngOnInit(): void {
    this.composeEntityTypeTabGroup();
    this.codeMirrorService.instance$
      .subscribe((editor) => {
        this.dslSearchCodeMirrorEditor = editor;
        editor.on('keyup', (cm, event) => {
          const specialKeys = [32, 27, 37, 38, 39, 40];
          if (specialKeys.includes(event.keyCode)) {
            return;
          }
          if (event.keyCode === 13 && event.ctrlKey) {
            return this.onSearchStringChanged();
          }
          if (!cm.state.completionActive && event.keyCode !== 13) {
            CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
          }
        });
      });
    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe((params: Params) => {
        this.setBreadcrumbLabel(params.searchString);
        this.searchWithParams(params);
      });
  }

  ngAfterViewInit(): void {
    if (this.table) {
      Observable.merge.apply(null, [this.table.sort.sortChange, this.table.paginator.page])
        .takeUntil(this.ngUnsubscribe)
        .subscribe(() => {
          this.initializeElements();
          this.getCIs(false);
        });
    }

    setTimeout(() => {
      this.utilsService.setDesirablePaginationOptions(this.table.paginator);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getDSLHintKeywords(cm, option) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = [];
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        let start = cursor.ch;
        let end = cursor.ch;
        while (start && /\w/.test(line.charAt(start - 1))) --start;
        while (end < line.length && /\w/.test(line.charAt(end))) ++end;
        const word = line.slice(start, end).toLowerCase();
        for (let i = 0; i < this.iquateKeywords.length; i++) {
          if (this.iquateKeywords[i].toLowerCase().indexOf(word) > -1) {
            result.push(this.iquateKeywords[i]);
          }
        }
        return resolve({
          list: result,
          from: CodeMirror.Pos(cursor.line, start),
          to: CodeMirror.Pos(cursor.line, end)
        });
      }, 500);
    });
  }

  private setBreadcrumbLabel(searchString): void {
    setTimeout(() => {
      const resultLabel = this.translate.instant('SEARCH.DO_SEARCH.RESULTS_FOR') + ` "${searchString || ''}"`;
      this.breadcrumbService.addLabel(this.activatedRoute, resultLabel);
    });
  }

  private setupAutoCompleteControl(): void {
    this.searchInputCtrl.valueChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe((keyword: string) => {
        if (!keyword) return;
        if (this.timeoutHandler) {
          clearTimeout(this.timeoutHandler);
          this.timeoutHandler = null;
        }
        if (!keyword.trim()) {
          return this.searchKeywords$ = Observable.of([]).share();
        }

        this.timeoutHandler = setTimeout(() => {
          this.searchKeywords$ = this.getSearchKeywords(keyword);
          this.timeoutHandler = null;
        }, 200);
      });
  }

  private composeEntityTypeTabGroup(): void {
    for (let i = 0; i < this.entityTypes.length; i++) {
      if (i < 7) {
        this.displayedEntityTypeTabItems.push(this.entityTypes[i]);
      } else {
        this.collapsedEntityTypeTabItems.push(this.entityTypes[i]);
      }
    }
  }

  private searchWithParams(params: Params): void {
    let composedParams = params;
    const { searchType, entityType, searchString, searchMode } = params;

    if (!searchType) {
      composedParams = {
        ...composedParams,
        searchType: this.searchTypes[0].value
      };
    } else if (this.searchTypes.findIndex((iterator: any) => (iterator.value === searchType)) === -1) {
      this.errorMessage = 'Unknown Search Type';
      return;
    }

    if (!entityType) {
      composedParams = {
        ...composedParams,
        entityType: this.entityTypes[0].value
      };
    } else if (this.entityTypes.findIndex((iterator: any) => (iterator.value === entityType)) === -1) {
      this.errorMessage = 'Unknown Entity Type';
      return;
    }
    this.errorMessage = null;

    if (!searchString && searchString !== '') {
      composedParams = {
        ...composedParams,
        searchString: ''
      };
    }

    if (!searchMode) {
      composedParams = {
        ...composedParams,
        searchMode: SEARCH_MODE_REGULAR
      };
    }

    this.getMetamodelInfo(composedParams.entityType);
    this.initializePaginator();
    this.initializeElements();
    this.prepareSearch(composedParams);
    this.initializeFacets();
    this.getCIs();
  }

  private getMetamodelInfo(entityType: string): void {
    let result$: Observable<any>;
    if (entityType === this.entityTypes[0].value) {
      result$ = this.metamodelService.getMetamodelClasses();
    } else {
      result$ = this.metamodelService.getMetamodelClassFields(entityType);
    }
    result$
      .take(1)
      .subscribe((result: any) => {
        this.iquateCIKeywordsList = [];
        this.iquateCIAttributeKeywordsList = [];
        this.iquateKeywords = [];

        if (entityType === this.entityTypes[0].value) {
          for (let i = 0; i < result.classes.length; i++) {
            this.parseMetamodelClassFields(result.classes[i]);
          }
        } else {
          this.parseMetamodelClassFields(result);
        }

        this.iquateKeywords = [...this.iquateCIKeywordsList, ...this.iquateCIAttributeKeywordsList];
      });
  }

  private parseMetamodelClassFields(classFieldsInfo): void {
    const currentAttributes = classFieldsInfo.attributes;
    const currentFields = classFieldsInfo.fields;

    for (let i = 0; i < currentAttributes.length; i++) {
      if (currentAttributes[i].name === 'name') {
        if (!this.iquateCIKeywordsList.includes(currentAttributes[i].value)) {
          this.iquateCIKeywordsList.push(currentAttributes[i].value);
        }
      }
    }

    for (let j = 0; j < currentFields.length; j++) {
      const nextAttributes = currentFields[j].attributes;
      for (let k = 0; k < nextAttributes.length; k++) {
        if (nextAttributes[k].name === 'name') {
          if (!this.iquateCIAttributeKeywordsList.includes(nextAttributes[k].value)) {
            this.iquateCIAttributeKeywordsList.push(nextAttributes[k].value);
          }
        }
      }
    }
  }

  public onDSLSearchCodeMirrorFocus(): void {
    this.dslSearchCodeMirrorFocused = true;
    this.changeDetectionRef.detectChanges();
  }

  public onDSLSearchCodeMirrorBlur(): void {
    this.dslSearchCodeMirrorFocused = false;
    this.changeDetectionRef.detectChanges();
  }

  private initializePaginator(): void {
    if (this.table) {
      this.table.paginator.pageIndex = 0;
    }
  }

  private initializeElements(): void {
    this.dataPopulated = false;
    this.totalRows = 0;
  }

  private prepareSearch(params): void {
    this.searchType = params.searchType;
    this.entityType = params.entityType;
    this.searchString = params.searchString;
    this.searchMode = params.searchMode;
    this.entityConfigInstance = _.find(SearchConfiguration[this.searchType],
      (iterator: any) => (iterator.entity === this.entityType));

    this.setSelectedEntityTypeTabIndex();
    this.setUpColumns();
    setTimeout(() => { this.makeTableActionsMenu(); }, 0);
  }

  private setSelectedEntityTypeTabIndex(): void {
    let foundIndex = _.findIndex(this.displayedEntityTypeTabItems, <any>{ 'value': this.entityType });
    if (foundIndex === -1) {
      foundIndex = _.findIndex(this.collapsedEntityTypeTabItems, <any>{ 'value': this.entityType });
      const exchangedEntityType = this.displayedEntityTypeTabItems.pop();
      this.collapsedEntityTypeTabItems.push(exchangedEntityType);
      this.displayedEntityTypeTabItems.splice(1, 0, this.collapsedEntityTypeTabItems[foundIndex]);
      this.collapsedEntityTypeTabItems.splice(foundIndex, 1);
      foundIndex = 1;
    }
    this.entityTypeIndex = foundIndex;
  }

  private setUpColumns(): void {
    const { columns } = this.entityConfigInstance;
    let columnIterator = null;

    const composedColumns = columns.map((iterator: any) => {
      if (iterator.type === 'date' || iterator.type === 'datetime') {
        columnIterator = <ColumnDefinition<RowModel, number>>
          {
            def: iterator.field,
            header: iterator.header,
            row2cell: (i, row) => row.ci[iterator.field] || 0,
            cell: (i, j, cell) => (cell) ? moment(cell).format('DD/MM/YYYY hh:mm:ss') : '-',
            sort: iterator.sortable
          };
      } else {
        columnIterator = <ColumnDefinition<RowModel, any>>
          {
            def: iterator.field,
            header: iterator.header,
            row2cell: (i, row) => row.ci[iterator.field] || '-',
            sort: iterator.sortable,
            popoverTooltip: (i, row) =>
              (iterator.field === 'processList' || iterator.field === 'cxList') ? row.ci[iterator.field] || '' : ''
          };
      }

      return columnIterator;
    });

    if (this.searchString && this.entityConfigInstance.highlighting) {
      composedColumns.push(<ColumnDefinition<RowModel, string>>
        {
          def: 'highlight',
          header: 'Highlight',
          row2cell: (i, row) => row.ci.highlight,
          html: true,
          sort: false,
          popoverTooltip: (i, row) => row.ci.highlight
        }
      );
      this.withHighlight = true;
    } else {
      this.withHighlight = false;
    }

    this.columns = [
      <IconColumn<RowModel>>
      {
        def: 'entityType',
        header: '',
        row2cell: (i, row) => ({
          extension: '.svg',
          icon: Transforms.entityTypeIconTransform(i, row.ci),
          title: ''
        }),
        cell: this.resolver.resolveComponentFactory(EffectIconComponent),
        tooltip: (i, row) => (row.ci.expirationDate && row.ci.expirationDate > 0) ? ('[AGEING] - ' + row.ci.className) : row.ci.className
      },
      ...composedColumns,
      <ActionColumn<RowModel>>
      {
        def: 'actions',
        row2cell: (i, row) => ({ rowData: row, menuItems: this.makeTableActionsMenu() }),
        header: '',
        cell: this.resolver.resolveComponentFactory(TableActionsButtonComponent)
      }
    ];

    this.rowDefs[0].columns = _.map(this.columns, 'def');
    this.trackBy = (i, viewModel) => JSON.stringify(this.rowDefs[0].columns.filter(columnName => columnName !== 'actions')
      .reduce((agg: any, key: string) => { agg[key] = viewModel.cellMap[key]; return agg; }, {}));
  }

  private makeTableActionsMenu(): ActionButton<RowModel>[] {
    const actionKeys: string[] = [];
    const { actions } = this.entityConfigInstance;
    let translatedKey = '';
    let tooltipStr = '';

    if (actions && actions.length > 0) {
      translatedKey = this.translate.instant(actions[0].key);
      tooltipStr = `Double Click: ${translatedKey}`;
      actionKeys.push(actions[0].key);

      if (actions.length > 1) {
        translatedKey = this.translate.instant(actions[1].key);
        tooltipStr = `${tooltipStr} \n Ctrl + Double Click: ${translatedKey}`;
        actionKeys.push(actions[1].key);
      }
    }
    this.rowDefs[0].tooltip = tooltipStr;

    const menuActionEventHandler: ActionButtonHandler<RowModel> = (payload: ActionButtonEvent<RowModel>) => {
      const { key, rowData } = payload;
      const foundIndex = _.findIndex(actions, { key });

      const actionParams = actions[foundIndex].parameters;
      let params = _.reduce(actionParams, (result, iterator: ActionParam) => {
        result[iterator.param] = (iterator.field) ? rowData.ci[iterator.field] : iterator.value;
        return result;
      }, {});
      params = _.pickBy(params, (value) => (!!value));

      this.menuService.emitRedirect({
        url: '/main/it-explorer/open',
        ...params
      });
    };

    return actionKeys.map(key => {
      const events = new Subject<ActionButtonEvent<RowModel>>();
      events.takeUntil(this.ngUnsubscribe).subscribe(menuActionEventHandler);
      return { key, title: key, events };
    });
  }

  private initializeFacets(): void {
    let facetItems: FacetItem[] = [];
    this.facets = this.entityConfigInstance.facets.map((iterator: ImportedFacet) => {
      facetItems = Object.keys(iterator.values).map(key => ({
        label: iterator.values[key],
        originalLabel: iterator.values[key],
        value: key,
        visible: true
      }));
      facetItems.unshift({
        label: 'All',
        originalLabel: 'All',
        value: '',
        visible: true
      });

      return {
        placeholder: iterator.header,
        name: iterator.field,
        selectedValue: '',
        items: facetItems
      };
    });
  }

  private static flattenCIProcessListArray(iterator: CIWrapper): void {
    const fields = ['processList', 'cxList'];
    let field;

    for (let i = 0; i < fields.length; i++) {
      field = fields[i];
      if (iterator.result[field] && iterator.result[field].length >= 0) {
        for (let j = 0; j < iterator.result[field].length; j++) {
          iterator.result[field][j] = JSON.stringify(iterator.result[field][j]);
          iterator.result[field][j] = iterator.result[field][j].replace(/:/g, ': ');
          iterator.result[field][j] = iterator.result[field][j].replace(/,/g, ', ');
        }
        iterator.result[field] = iterator.result[field].join(', \n');
      }
    }
  }

  private composeDoSearchParams(): StringableCollection {
    const orderBy = (this.table && this.table.sort.direction) ? this.table.sort.active : undefined;
    const orderDir = (this.table && this.table.sort.direction) ? this.table.sort.direction : undefined;

    let params: StringableCollection = [{
      from: (this.table) ? this.table.paginator.pageIndex * this.table.paginator.pageSize : 0,
      pageSize: (this.table) ? this.table.paginator.pageSize : this.paging.pageSize,
      entity: (this.entityType !== 'All') ? this.entityType : undefined,
      orderBy,
      orderDir,
      q: (this.searchString !== '') ? this.searchString : undefined,
      searchMode: (this.searchMode) ? this.searchMode : undefined,
      highlight: (this.searchString !== '') ? this.entityConfigInstance.highlighting : undefined
    }];
    params = _.concat(params, this.entityConfigInstance.fields.map(iterator => ({ s: iterator })));
    params = _.concat(params, this.facets.map(iterator => ({ ff: iterator.name })));
    params = _.concat(params, this.facets.filter(iterator => (iterator.selectedValue !== '')).map(
      iterator => ({ fq: iterator.name + ':"' + iterator.selectedValue + '"' })
    ));

    return params;
  }

  private updateFacetsWithCountResult(result: SearchAPIResult<CIWrapper>): void {
    // Use Facet count result info
    let facetKey = null;
    let facetItemKey = null;
    let facetItemCount = 0;

    for (let i = 0; i < this.facets.length; i++) {
      facetKey = this.facets[i].name;

      for (let j = this.facets[i].items.length - 1; j >= 1; j--) {
        facetItemKey = this.facets[i].items[j].value;
        facetItemCount = 0;

        if (result.facetFields && result.facetFields[facetKey] && result.facetFields[facetKey][facetItemKey]) {
          facetItemCount = result.facetFields[facetKey][facetItemKey];
          this.facets[i].items[j].visible = true;
        } else {
          this.facets[i].items[j].visible = false;
        }

        this.facets[i].items[j].label = this.facets[i].items[j].originalLabel + ' (' + facetItemCount + ')';
      }
    }
  }

  private getUpdatedFacetLabel(facet: Facet) {
    return facet.items.find(itemIterator => itemIterator.value === facet.selectedValue).label;
  }

  private processCIsResult(result: SearchAPIResult<CIWrapper>): SearchAPIResult<RowModel> {
    let copiedData: RowModel[] = null;
    let highlightData;
    let highlightString;

    // Compose result cis with highlight data
    if (this.searchString && this.entityConfigInstance.highlighting) {
      copiedData = result.data.map((iterator: CIWrapper) => {
        highlightData = iterator.highlight;
        highlightString = '';
        for (const key in highlightData) {
          if (highlightData.hasOwnProperty(key)) {
            highlightString += key.substring(key.indexOf('.') + 1) + ': ';
            highlightString += highlightData[key].join(',') + '\n';
          }
        }
        DoSearchComponent.flattenCIProcessListArray(iterator);
        return <RowModel>{
          ci: {
            ...iterator.result,
            highlight: highlightString
          }
        };
      });
    } else {
      copiedData = result.data.map((iterator: CIWrapper) => {
        DoSearchComponent.flattenCIProcessListArray(iterator);
        return <RowModel>{ ci: iterator.result };
      });
    }

    return {
      total: result.total,
      data: copiedData
    };
  }

  private fetchCIs(useFacetCountResult: boolean): Observable<SearchAPIResult<RowModel>> {
    // Compose search params to call getCIs method of search service
    const params: StringableCollection = this.composeDoSearchParams();

    return this.searchService.getCIs(params)
      .catch((err: any) => {
        // this.errorMessage = err.message;
        return Observable.of({ total: 0, data: [] });
      })
      .map((cisResult: SearchAPIResult<CIWrapper>) => {
        this.errorMessage = null;
        this.dataPopulated = true;
        this.totalRows = cisResult.total;

        if (this.facets.length > 0 && useFacetCountResult) {
          this.updateFacetsWithCountResult(cisResult);
        }

        return this.processCIsResult(cisResult);
      }).share();
  }

  private getCIs(useFacetCountResult: boolean = true): void {
    this.fetchCIs(useFacetCountResult)
      .takeUntil(this.ngUnsubscribe)
      .finally(() => {
        this.entityTypeDataLoading = false;
      })
      .subscribe((fetchedResult: SearchAPIResult<RowModel>) => {
        this.searchResult$.next(fetchedResult);
      });
  }

  private getSearchKeywords(keyword: string): Observable<string[]> {
    const params: StringableCollection = {
      from: 0,
      pageSize: 9999,
      entity: (this.entityType !== 'All') ? this.entityType : undefined,
      q: keyword
    };
    return this.searchService.getSearchKeywords(params)
      .catch((err: any) => {
        return Observable.of([]).share();
      });
  }

  private filterShouldBeHidden(): boolean {
    if (this.facets.length === 0) {
      return true;
    }

    const maxItemsFacet = _.maxBy(this.facets, function (facetIterator) { return facetIterator.items.length; });

    return (maxItemsFacet && maxItemsFacet.items.length <= 1);
  }

  private goToSearchWithParams(): void {
    this.searchString = this.searchString.trim();
    this.router.navigate(['/main/search/do-search', {
      searchType: this.searchType,
      entityType: this.entityType,
      searchString: this.searchString,
      searchMode: this.searchMode
    }]);
  }

  private onSearchTypeChanged(): void {
    this.goToSearchWithParams();
  }

  private onEntityTypeChanged(tabItemType: string, selectedEntity: any): void {
    if (this.entityTypeDataLoading) {
      return;
    }
    this.entityTypeDataLoading = true;
    if (tabItemType === 'displayed') {
      const foundIndex = _.findIndex(this.displayedEntityTypeTabItems,
        iterator => (this.translate.instant(iterator.plural) === selectedEntity.tab.textLabel));
      this.entityType = this.displayedEntityTypeTabItems[foundIndex].value;
    } else {
      this.entityType = selectedEntity.value;
    }

    this.goToSearchWithParams();
  }

  private onSearchStringChanged(): void {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
    this.searchKeywords$ = Observable.of([]).share();

    if (this.searchMode === SEARCH_MODE_DSL) {
      this.searchInputCtrl.setValue(this.dslSearchCodeMirrorEditor.getValue());
      this.searchInputCtrl.markAsTouched();
    }
    if (this.searchInputCtrl.invalid) return;

    this.goToSearchWithParams();
  }

  private onFacetSelectedValueChanged(): void {
    this.initializePaginator();
    this.initializeElements();
    this.getCIs(true);
  }

  private openSaveSearchModal(): void {
    if (this.searchInputCtrl.invalid) return;

    const { entityType } = this;
    const { searchString, searchMode } = this.activatedRoute.snapshot.params;
    const dialogRef = this.dialog.open(SaveSearchModalComponent, {
      width: '400px',
      panelClass: 'save-search-modal',
      data: { entityType, searchString, searchMode }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe();
  }

  private goToManageSavedSearches(): void {
    this.router.navigate([`/main/search/manage-saved-searches`]);
  }

  public refresh(): void {
    this.getCIs(false);
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

  private onRowDoubleClicked(rowIndex: number, row: RowModel, event): void {
    const { actions } = this.entityConfigInstance;

    if (actions.length === 0 || (event.ctrlKey && actions.length < 2)) {
      return;
    }

    let actionParams = null;
    if (!event.ctrlKey) {
      actionParams = actions[0].parameters;
    } else {
      actionParams = actions[1].parameters;
    }
    let params = _.reduce(actionParams, (result, iterator: ActionParam) => {
      result[iterator.param] = (iterator.field) ? row.ci[iterator.field] : iterator.value;
      return result;
    }, {});
    params = _.pickBy(params, (value) => (!!value));

    this.menuService.emitRedirect({
      url: '/main/it-explorer/open',
      ...params
    });
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

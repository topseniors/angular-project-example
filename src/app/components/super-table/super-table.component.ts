import {
  Component, Input, ViewChild, OnInit, OnDestroy, AfterViewInit,
  OnChanges, SimpleChanges, SimpleChange, Output, EventEmitter,
  Pipe, PipeTransform, ComponentFactory, ComponentFactoryResolver,
  EmbeddedViewRef, TemplateRef, ViewContainerRef, ComponentRef,
  Directive, HostListener, HostBinding,
  ReflectiveInjector, ValueProvider, ResolvedReflectiveProvider
} from '@angular/core';
import { Subscription, Observable, Subject, AsyncSubject, ReplaySubject, BehaviorSubject } from 'rxjs/Rx';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatTable, MatSort, MatPaginator, MatInput } from '@angular/material';
import { APIResult } from '../../services/apis/api.service';
import { SuperDataSource } from './super-data-source';
import './super-table.types';
import Utils from '../../utils';
import * as _ from 'lodash';
import * as moment from 'moment';

export const DEFAULT_PAGESIZE_OPTIONS = [5, 10, 15, 20, 50, 100];

@Component({
  selector: 'super-table',
  templateUrl: './super-table.component.html',
  styleUrls: ['./super-table.component.less'],
  animations: [
    trigger('detailExpand', [
      state('void', style({height: '0px', minHeight: '0', visibility: 'hidden'})),
      state('*', style({height: '*', visibility: 'visible'})),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SuperTableComponent<R> implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() refresh?: any;
  @Input() columns: ColumnDefinition<R>[];
  @Input() rowDefs: RowDefinition<R>[];
  @Input() trackBy?: RowTransform<R>;
  @Input() data: Observable<APIResult<R>>;
  @Input() linked: boolean;
  @Input() filtering: boolean | {placeholder: string};
  @Input() paging: boolean | { pageSize: number, pageSizeOptions: any };
  @Output() interrupt = new EventEmitter<InterruptEvent>();
  @Output() output$ = new BehaviorSubject<ViewModel<R>[]>([]);

  filterInputVisible = false;
  tableResizeTimeoutHandler = null;

  private _dataSource: SuperDataSource<R>;
  private _error$ = new ReplaySubject<any>();
  private _sub: Subscription;
  private _sub2: Subscription;
  private _sub3: Subscription;
  public popoverTooltipContent = [];
  public popoverTooltipKeys = [];

  constructor(private translate: TranslateService, private resolver: ComponentFactoryResolver) { }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatInput) filter: MatInput;

  ngOnInit() {
    ['linked', 'filtering', 'paging'].forEach(flag => {
      this[flag] = this.hasOwnProperty(flag) && this[flag] || (<any>this[flag] === '');
    });
    this._dataSource = new SuperDataSource<R>(this.linked, !!this.paging, this.interrupt);
    this._sub3 = this._dataSource.output$.subscribe(rows => { this.output$.next(rows); });
  }

  ngAfterViewInit() {
    const sort$: Observable<SortEvent> = this.sort.sortChange
      .map(({active, direction}) => (<SortEvent>{ event: 'sort', property: active, direction }))
      .startWith(<SortEvent>{ event: 'sort', direction: '', property: '' });

    const page$: Observable<PageEvent> = this.paginator.page
      .map(({ pageIndex, pageSize }) => (<PageEvent>{ event: 'page', start: pageIndex * pageSize, limit: pageSize }))
      .startWith(<PageEvent>{ event: 'page', start: 0, limit: this.paginator.pageSize });

    const filter$: Observable<FilterEvent> = this.filter.stateChanges
      .map(() => this.filter.value).debounceTime(250).distinctUntilChanged()
      .map(value => (<FilterEvent>{ event: 'filter', value }));

    this._sub2 = Observable.merge(...[sort$, page$, filter$])
      .subscribe((e: InterruptEvent) => this.interrupt.next(e));
  }

  ngOnDestroy() {
    if (this._sub) this._sub.unsubscribe();
    if (this._sub2) this._sub2.unsubscribe();
    if (this._sub3) this._sub3.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // force async to avoid making changes twice in the same digest cycle
    setTimeout(() => {
      if (changes['columns']) this.updateColumns();
      if (changes['data']) this.updateData();
    });
  }

  public getMinPageSize(): number {
    if (!this.paginator || !this.paginator.pageSizeOptions || !this.paginator.pageSizeOptions.length) {
      return 0;
    }

    return Math.min(...this.paginator.pageSizeOptions);
  }

  public onCellHover(columnDef: string, tooltipText: string) {
    if (!tooltipText) {
      return;
    }

    try {
      if (columnDef === 'highlight') {
        const tooltipLines = tooltipText.split('\n');
        const revisedTooltipLines = [];
        tooltipLines.forEach(tooltipLine => {
          if (tooltipLine === '') {
            return;
          }
          tooltipLine = tooltipLine.replace(/"/g, `'`);
          tooltipLine = tooltipLine.replace(/\\/g, `/`);
          revisedTooltipLines.push(tooltipLine.replace(/(.*):\s(.*)/, `"$1":"$2"`));
        });
        tooltipText = revisedTooltipLines.join(',');
        tooltipText = `{${tooltipText}}`;
      }
      this.popoverTooltipContent = JSON.parse(`[${tooltipText}]`);
      this.popoverTooltipKeys = Object.keys(this.popoverTooltipContent[0]);
    } catch (error) {
      this.popoverTooltipContent = [];
      this.popoverTooltipKeys = [];
    }
  }

  private convert(i: number, row: R): ViewModel<R> {
    return {
      row: row,
      cellMap: this.columns.reduce((a: any, b: ColumnDefinition<R>) => {
        a[b.def] = b.row2cell(i, row); return a;
      }, {}),
      tooltipMap: this.columns.reduce((a: any, b: ColumnDefinition<R>) => {
        if (_.isString(b.tooltip)) a[b.def] = b.tooltip;
        else if (_.isFunction(b.tooltip)) a[b.def] = b.tooltip(i, row);
        else a[b.def] = '';
        return a;
      }, {}),
      popoverTooltipMap: this.columns.reduce((a: any, b: ColumnDefinition<R>) => {
        if (_.isString(b.popoverTooltip)) a[b.def] = b.popoverTooltip;
        else if (_.isFunction(b.popoverTooltip)) a[b.def] = b.popoverTooltip(i, row);
        else a[b.def] = '';
        return a;
      }, {}),
      cssClassMap: this.columns.reduce((a: any, b: ColumnDefinition<R>) => {
        if (_.isString(b.cssClass)) a[b.def] = b.cssClass;
        else if (_.isFunction(b.cssClass)) a[b.def] = b.cssClass(i, row);
        else a[b.def] = '';
        return a;
      }, {})
    };
  }

  private typeOf(d: CellTemplate): string {
    if (d && d instanceof ComponentFactory) {
      return 'custom';
    } else if (d && d instanceof TemplateRef) {
      return 'template';
    } else {
      return typeof d;
    }
  }

  private updateColumns(): void {
    if (!this.columns) return;
    this.columns.forEach(column => {
      column.row2cell = column.row2cell || ((i, row) => row[column.def]); // default cell transform
      column.onCellClicked = column.onCellClicked || ((cell, event) => {});
    });
    this._dataSource.sortMap = this.columns.reduce((a, b) => {
      if (b.sort && typeof b.sort === 'function') a[b.def] = b.sort; return a;
    }, {});
  }

  private updateData(): void {
    if (!this.data) return;
    if (this._sub) this._sub.unsubscribe();
    this._sub = this.data.subscribe(
      (c: APIResult<R>) => {
        if (!c) {
          this._dataSource.filteredTotal$.next(0);
          this._dataSource.update([]);
          return;
        }
        if (!this.linked) {
          this._dataSource.filteredTotal$.next(c.total);
        }
        const converted: ViewModel<R>[] = c.data.map((d, i) => this.convert(i, d));
        return this._dataSource.update(converted);
      },
      err => {
        this._error$.next(err);
      }
    );
  }

  clearFilterText(): void {
    this.filter.value = '';
  }

  toggleFilterInput(): void {
    this.filterInputVisible = !this.filterInputVisible;
    if (this.filterInputVisible) {
      setTimeout(() => {
        this.filter.focus();
      });
    }
  }

  getSortDirection(column: string): string {
    return (this.sort && this.sort.active === column) ? this.sort.direction : '';
  }
}

@Directive({ selector: '[iqCustomCell]'})
export class CustomCellDirective<C> {
  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) { }
  @Input() set iqCustomCell({factory, inputs}) {
    if (!this.viewContainer.length) {
      const componentRef = this.viewContainer.createComponent(factory);
      if (inputs instanceof Function) inputs(componentRef.instance);
      else Object.assign(componentRef.instance, inputs);
    }
  }
}

@Directive({
  selector: '[expandedRow]'
})
export class ExpandedRowDirective<R, TR, C = any> implements OnInit {
  @Input() expandedRow: ExpandedRow<R, TR, C>;
  @Input() expandedRowModel: R;
  @Input() expandedRowIndex: number;
  @HostBinding('class.expanded') expanded = false;
  @HostListener('click', ['$event']) onClick(event): void {
    // see https://github.com/angular/angular/issues/9587
    if (event.__zone_symbol__propagationStopped) return;
    else if (this.enabled) this.toggle();
  }
  private enabled = false;

  constructor(public viewContainer: ViewContainerRef,
              private resolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.enabled = !_.isUndefined(this.expandedRow);
  }

  toggle(): void {
    if (this.expanded)  this.viewContainer.clear();
    else this.render();
    this.expanded = this.viewContainer.length > 0;
  }

  private render(): void {
    this.viewContainer.clear();

    const hasComponent: boolean = this.expandedRow.hasOwnProperty('component');
    const hasTemplate: boolean = this.expandedRow.hasOwnProperty('template');

    if (hasComponent === hasTemplate) {

      if (hasComponent && hasTemplate) {
        console.warn('[expandedRow] shouldn\'t define both a template and a factory');
      } else {
        console.warn('[expandedRow] should define at least a template or a factory');
      }

    } else {

      let context = (<ExpandedRowContext<TR>>this.expandedRow).context;
      if (_.isUndefined(context)) {
        const transform = (<ExpandableRowTransform<R, TR>>this.expandedRow).transform;
        if (_.isUndefined(transform)) {
          console.warn('[expandedRow] should define at least a context or transform function');
          return;
        }
        context = transform(this.expandedRowIndex, this.expandedRowModel);
      }

      if (hasComponent && !hasTemplate) {

        const contextProviders: ValueProvider[] = Object.keys(context).map(key => ({provide: key, useValue: context[key]}));
        const resolvedInputs: ResolvedReflectiveProvider[] = ReflectiveInjector.resolve(contextProviders);
        const injector: ReflectiveInjector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.viewContainer.injector);

        const component: C = (<ExpandedRowComponent<C>>this.expandedRow).component;
        const factory: ComponentFactory<C> = this.resolver.resolveComponentFactory(<any>component);
        const element: ComponentRef<C> = this.viewContainer.createComponent(factory, 0, injector);

      }  else {

        const template: TemplateRef<ExpandedRowContext<TR>> = (<ExpandedRowTemplate<TR>>this.expandedRow).template;
        const view: EmbeddedViewRef<ExpandedRowContext<TR>> = this.viewContainer.createEmbeddedView(template, {context});

      }
    }
  }
}

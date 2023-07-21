import { Component, ComponentFactory, TemplateRef } from '@angular/core';
import { TableActionsButtonComponent, ActionButton, ActionButtonInterface } from '../table-actions-button/table-actions-button.component';
import { EffectIconComponent, EffectIcon } from '../effect-icon/effect-icon.component';
import { ProgressBar, ProgressData, ProgressInput } from '../progress-bar/progress-bar.component';
import { SuperTableComponent } from './super-table.component';

declare module './super-table.component' {
  /** Generic transform function to modify a datum */
  export type Transform<D = any, T = any> = (d: D) => T;
  /**
   * Used to transform a row into another data format.
   * @index comes first to mimic the TrackByFunction interface from MatTable and ngFor
   */
  export type RowTransform<R = any, T = any> = (index: number, row: R) => T;
  export type RowTransformInvert<R = any, T = any> = (row: R, index: number) => T;
  /**
   * Used to transform a cell into another data format.
   * `viewModel` and `columnIndex` are available to locate the cell within the table.
   */
  export type CellTransform<C = any, T = any> = (rowIndex: number, columnIndex: number, cell: C) => T;

  /**
   * Can be either a `ComponentFactory`, a display `string` or a `CellTransform`
   * `function` taking in a `cell` model and outputting a display `string`
   */
  export type CellHeaderTemplate<T = any, C = Component> = string | TemplateRef<T> | ComponentFactory<C>;
  export type CellTemplate<T = any, C = Component> = string | CellTransform<T, string> | ComponentFactory<C> | TemplateRef<T>;

  /**
   * @def used with `MatColumnDef` and `MatHeaderRowDef`.
   * Can be used for styling in the custom CSS by using `.mat-column-<column.def>`
   * @row2cell is a transform function used to generate the cell view model from an input row.
   * If `undefined` defaults to `(i,row) => row[column.def]`.
   * The cell view model is used for sorting and filtering operations and/or component instantiation.
   * @header columns header display. if `undefined` then `column.def` will be used instead.
   * Note that either way the value will be piped through the translate pipe for translation if applicable.
   * @cell see `CellTemplate` type definition. If `column.cell` is a `Componentfactory` then `cell.value`
   * should be a callback taking in the component instance after initialisation (used for hooking up inputs/outputs).
   * If `undefined` then cell template becomes `{{ cell.value }}`
   * @sort flag use to enable column sorting. If set to `true`, it will use `cell.value` for sorting,
   * note that then `column.row2cell` should output either a `string` or a `number` for comparison.
   * If set to a function it will take `cell.value` as input and should also output a comparable value.
   */
  export interface ColumnDefinition<R, CE = any, CO = Component> {
    def: string;
    row2cell?: RowTransform<R, CE>;
    header?: CellHeaderTemplate<CE, CO>;
    headerContext?: any;
    headerCssClass?: string;
    cell?: CellTemplate<CE, CO>;
    html?: boolean;
    sort?: boolean | Transform<CE, number | string>;
    onCellClicked?: (rowIndex: number, columnIndex: number, viewModel: ViewModel<R>, event: Event) => void;
    tooltip?: string | RowTransform<R, string>;
    popoverTooltip?: string | RowTransform<R, string>;
    cssClass?: string | RowTransform<R, string>;
  }

  export interface RowDefinition<R> {
    columns: string[];
    predicate?: any;
    _predicate?: boolean;
    expandedRow?: ExpandedRow<R, any, any>;
    onRowClicked?: (rowIndex: number, row: R, event: Event) => void;
    onRowDoubleClicked?: (rowIndex: number, row: R, event: Event) => void;
    tooltip?: string;
    popoverTooltip?: string;
  }

  interface ExpandableRowTransform<R, TR> { transform?: (i: number, row: R) => TR; }
  interface ExpandedRowContext<TR> { context: TR; }
  interface ExpandedRowTemplate<TR> { template: TemplateRef<ExpandedRowContext<TR>>; }
  interface ExpandedRowComponent<C> { component: C; }
  interface ExpandedRowTemplateInput<R, TR> extends ExpandableRowTransform<R, TR>, ExpandedRowTemplate<TR> {}
  interface ExpandedRowTemplateModel<TR> extends ExpandedRowContext<TR>, ExpandedRowTemplate<TR> {}
  interface ExpandedRowFactoryInput<R, TR, C> extends ExpandableRowTransform<R, TR>, ExpandedRowComponent<C> {}
  interface ExpandedRowFactoryModel<TR, C> extends ExpandedRowContext<TR>, ExpandedRowComponent<C> {}
  type ExpandedRowInput<R, TR, C> = ExpandedRowTemplateInput<R, TR> | ExpandedRowFactoryInput<R, TR, C>;
  type ExpandedRowModel<TR, C> = ExpandedRowTemplateModel<TR> | ExpandedRowFactoryModel<TR, C>;
  export type ExpandedRow<R, TR, C = any> = ExpandedRowInput<R, TR, C> | ExpandedRowModel<TR, C>;

  /**
   * The `RowModel` is being fed to the internal `DataSource` and is being used internally
   * for sorting and filtering.
   * @model is the whole row model returned from the API
   * @viewModel is a map of `columnName` to `cellViewModel`.
   * If a given `ColumnDefinition` doesn't have a `transform` function, the `row`
   * model is used for that column instead of the transformed `cell` view model.
   */
  export interface ViewModel<R> {
    row: R;
    cellMap: {[columnName: string]: any};
    tooltipMap?: {[columnName: string]: any};
    popoverTooltipMap?: {[columnName: string]: any};
    cssClassMap?: {[columnName: string]: any};
  }

  // convenience types
  export type ActionColumn<T> = ColumnDefinition<T, ActionButtonInterface<T>, TableActionsButtonComponent<T>>;
  export type IconColumn<T> = ColumnDefinition<T, EffectIcon, EffectIconComponent>;
  export type ProgressColumn<T> = ColumnDefinition<T, ProgressInput, ProgressBar>;
  // event types
  export interface FilterEvent { event: 'filter'; value: string; }
  export interface SortEvent { event: 'sort'; property: string; direction: string; }
  export interface PageEvent { event: 'page'; start: number; limit: number; }
  export interface PaginationOptions { pageSize: number; pageSizeOptions: number[]; }
  export type InterruptEvent = FilterEvent | SortEvent | PageEvent;
}

import { EventEmitter } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Subscription, Observable, Subject, AsyncSubject, ReplaySubject, BehaviorSubject } from 'rxjs/Rx';
import { ViewModel, CellTransform, SortEvent, PageEvent, FilterEvent, InterruptEvent } from './super-table.component';
import * as _ from 'lodash';

/**
 * Used by the Component to apply table directives (sort/filter/page) related data transformations
 * Might be replaced or at least extend MatTableDataSource if/when upgrading to Angular5.
 */
export class SuperDataSource<R> extends DataSource<ViewModel<R>> {

    private input$ = new BehaviorSubject<ViewModel<R>[]>([]);
    filteredTotal$ = new BehaviorSubject<number>(0);
    output$ = new BehaviorSubject<ViewModel<R>[]>([]);
    private _sub: Subscription;
    sortMap: {[columnName: string]: CellTransform<any, number>};

    private sort: SortEvent;
    private page: PageEvent;
    private filter: FilterEvent;

    constructor(private linked: boolean, private paging: boolean, private interrupt: EventEmitter<InterruptEvent>) {
      super();
      this._sub = Observable.merge(...[
        this.input$,
        this.interrupt.do(e => this[e.event] = e)
      ]).subscribe(() => {
        const data = this.input$.value.slice();
        if (!this.linked) this.output$.next(data);
        else {
          const filteredData = this.filterData(data);
          this.filteredTotal$.next(filteredData.length);
          const sortedFilteredData = this.sortData(filteredData);
          const pagedSortedFilteredData = this.pageData(sortedFilteredData);
          this.output$.next(pagedSortedFilteredData);
        }
      });
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<ViewModel<R>[]> { return this.output$; }

    disconnect(): void { if (this._sub) this._sub.unsubscribe(); }

    update(data: ViewModel<R>[]): void {
      this.input$.next(data);
    }

    private sortData(data: ViewModel<R>[]): ViewModel<R>[] {
      data = data.slice(); // shallow copy
      if (!this.sort || this.sort.property === '' || this.sort.direction === '') return data;
      const sortTransform: CellTransform<any, number> = this.sortMap && this.sortMap[this.sort.property];
      const sortFn = (a: ViewModel<R>, b: ViewModel<R>) => {
        const cellAccessor = (d: ViewModel<R>) => {
          const cellValue = d.cellMap && d.cellMap[this.sort.property];
          let returnValue = (!_.isUndefined(cellValue)) ? cellValue : d.row[this.sort.property];
          if (typeof returnValue === 'string') returnValue = returnValue.toLowerCase();
          return returnValue;
        };
        const [cellA, cellB]: any[] = [a, b].map(cellAccessor);
        const [valueA, valueB] = (sortTransform) ? [cellA, cellB].map(sortTransform) : [cellA, cellB];
        const typeChecker = (d: any) => typeof d === 'number' || typeof d === 'string';
        if (![valueA, valueB].every(typeChecker)) {
          console.warn('Cannot compare values ', valueA, valueB); return 0;
        } else {
          return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        }
      };
      return data.sort(sortFn);
    }

    private pageData(data: ViewModel<R>[]): ViewModel<R>[] {
      const copiedData = data.slice(); // shallow copy
      if (!this.paging || !this.page) { return copiedData; }
      return copiedData.splice(this.page.start, this.page.limit);
    }

    private filterData(data: ViewModel<R>[]): ViewModel<R>[] {
      data = data.slice(); // shallow copy
      if (!this.filter || this.filter.value === '') { return data; }
      return data.filter((d: ViewModel<R>) => {
        let stringified = ''; // warn recursive json structures will fail
        try { stringified += JSON.stringify(d.row); } catch (e) {}
        try { stringified += JSON.stringify(_.values(d.cellMap)); } catch (e) {}
        return (stringified.toLowerCase()).indexOf(this.filter.value.toLowerCase()) > -1;
      });
    }
  }

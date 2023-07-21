import { Injectable } from '@angular/core';

export const PAGE_AUDIT_EVENTS = 'page/audit-events';

@Injectable()
export class UtilsService {

  constructor() { }

  public setDesirablePaginationOptions(paginator): void {
    const superTableRect = document.getElementsByClassName('super-table')[0].getBoundingClientRect();
    const pageElementClassList = document.getElementsByClassName('page')[0].classList;
    let desiredTableHeight;
    let bottomDelta;

    if (pageElementClassList.contains('audit-page')) {
      bottomDelta = 135;
    } else if (pageElementClassList.contains('search-page')) {
      bottomDelta = 107;
    } else {
      bottomDelta = 117;
    }

    desiredTableHeight = window.innerHeight - superTableRect.top - bottomDelta;

    if (desiredTableHeight < 117) {
      desiredTableHeight = 117;
    }
    const newPageSize = Math.floor((desiredTableHeight / 39)) - 1;
    const newPageSizeOptions = paginator.pageSizeOptions;
    if (!newPageSizeOptions.includes(newPageSize)) {
      newPageSizeOptions.push(newPageSize);
      newPageSizeOptions.sort((a, b) => a - b);
    }
    const currentPageIndex = paginator.pageIndex;
    const currentPageSize = paginator.pageSize;
    const newPageIndex = Math.floor((currentPageIndex * currentPageSize) / newPageSize);
    paginator.pageIndex = newPageIndex;
    paginator.pageSize = newPageSize;
    paginator.pageSizeOptions = newPageSizeOptions;
    paginator.page.next({ pageIndex: newPageIndex, pageSize: newPageSize, length: paginator.length });
  }

  public getDesirableContentPanelHeight(page: string): number {
    if (page === PAGE_AUDIT_EVENTS) {
      return (window.innerHeight - 150);
    }
  }

  public getMinimizedNumberFormat(number: number): string {
    if (!number) {
      return '0';
    } else if (number < 1000) {
      return number.toString();
    } else if (number < 1000000) {
      return (number / 1000).toFixed(2) + 'k';
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(2) + 'm';
    }
    return number.toString();
  }
}

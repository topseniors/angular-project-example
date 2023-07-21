import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export type ActionButtonEvent<T> = { e:Event; key: string; rowData: T };
export type ActionButtonHandler<T> =  (payload:ActionButtonEvent<T>)=>void;
export type ActionButton<T> = { key: string; title:string; events: Subject<ActionButtonEvent<T>> };
export type ActionButtonInterface<T> = { rowData: T, menuItems: ActionButton<T>[] };
@Component({
  selector: 'app-table-actions-button',
  templateUrl: './table-actions-button.component.html',
  styleUrls: ['./table-actions-button.component.less']
})
export class TableActionsButtonComponent<T> implements ActionButtonInterface<T> {
  @Input() rowData: T;
  @Input() menuItems: ActionButton<T>[];
}

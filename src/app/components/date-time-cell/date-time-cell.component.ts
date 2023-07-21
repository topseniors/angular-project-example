import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { OnChanges, SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';

export interface DateTimeToken { started: number; };
@Component({
  selector: 'date-time-cell',
  templateUrl: './date-time-cell.component.html',
  styleUrls: ['./date-time-cell.component.less']
})
export class DateTimeCell implements OnChanges {
  set started(value: number) {
    this.updateDateTime(value);
  }
  private date: string;
  private time: string;

  constructor(private datePipe: DatePipe) {}

  ngOnChanges(changes: SimpleChanges): void {
  }

  private updateDateTime(started: number): void {
    const dateTimeTokens = this.datePipe.transform(started, 'MMM dd HH:mm').split(' ');
    this.date = dateTimeTokens.slice(0, 2).join(' ');
    this.time = dateTimeTokens[2];
  }
}

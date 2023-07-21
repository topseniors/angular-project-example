import { Component, OnInit, Input} from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  template: '{{renderValue}}'
})
export class DateRendererComponent implements ViewCell, OnInit {

  renderValue: string;

  @Input() value: string;
  @Input() rowData: any;

  ngOnInit() {
    this.renderValue = new Date(parseInt(this.value)).toLocaleString();
  }

}

import { Component, OnInit } from '@angular/core';
import { SummaryService } from '../../../services/apis/summary.service';

@Component({
  selector: 'app-summary',
  template: `
      <ng2-smart-table [settings]="settings" [source]="data"></ng2-smart-table>
  `
})
export class AppSummaryComponent implements OnInit {

  data = [];
  settings = {
    columns: {
      fld: {
        title: 'Application By Importance'
      },
      cnt: {
        title: '#'
      }
    },
    actions: undefined,
    hideSubHeader: true
  };

  constructor(private summaryService: SummaryService) {}

  ngOnInit() {
    this.summaryService.getAppSummary().subscribe((result:any) => {
      this.data = result.data;
    });
  }

}

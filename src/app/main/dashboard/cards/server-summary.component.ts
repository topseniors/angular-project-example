import { Component, OnInit } from '@angular/core';
import { SummaryService } from '../../../services/apis/summary.service';

@Component({
  selector: 'server-summary',
  template: `
      <ng2-smart-table [settings]="settings" [source]="data"></ng2-smart-table>
  `
})
export class ServerSummaryComponent implements OnInit {

  data = [];
  settings = {
    columns: {
      fld: {
        title: 'Servers By OS Type'
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
    this.summaryService.getServerSummary().subscribe((result:any) => {
      this.data = result.data;
    });
  }

}

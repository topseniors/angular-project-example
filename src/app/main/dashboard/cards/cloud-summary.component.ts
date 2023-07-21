import { Component, OnInit } from '@angular/core';
import { SummaryService } from '../../../services/apis/summary.service';
import { IGenericCard } from './generic-card.interface';

@Component({
  selector: 'app-summary',
  template: `
      <ng2-smart-table [settings]="settings" [source]="data"></ng2-smart-table>
  `
})
export class CloudSummaryComponent implements OnInit, IGenericCard {

  action = {
    label: 'GENERAL.ACTION'
  };
  filter = undefined;

  data = [];
  settings = {
    columns: {
      pdr: {
        title: 'Cloud Provider'
      },
      svc: {
        title: 'Cloud Service'
      },
      app: {
        title: 'Applications'
      },
      svr: {
        title: 'Servers'
      }
    },
    actions: undefined,
    hideSubHeader: true
  };

  constructor(private summaryService: SummaryService) {}

  ngOnInit() {
    this.summaryService.getCSD().subscribe((result:any) => {
      this.data = result.data.records;

    });
  }
}

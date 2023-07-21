import { Component, OnInit } from '@angular/core';
import { SummaryService } from '../../../services/apis/summary.service';
import { IGenericCard } from './generic-card.interface';
import * as _ from 'lodash';

@Component({
  selector: 'app-app-overview',
  template: `
    <app-treemap [data]="data"></app-treemap>
  `,
  styles: []
})
export class AppOverviewComponent implements OnInit, IGenericCard {

  action = {
    label: 'GENERAL.ACTION'
  };
  filter = {
    label: 'GENERAL.FILTER'
  };

  data = {};
  constructor(private summaryService: SummaryService) { }

  ngOnInit() {
    this.summaryService.getAppOverview().subscribe((result:any) => {
      result.data.children = _.map(result.data.children, (child: any) => {
        return {
          size: parseInt(child.serverCount),
          name: child.name
        }
      });
      this.data = result.data;
    });
  }

}

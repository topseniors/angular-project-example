import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html'
})
export class DashboardOverviewComponent implements OnInit {

  cards = [];

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.cards = [
      {
        type: 'appOverview',
        title: 'DASHBOARD.OVERVIEW.APPLICATIONS_OVERVIEW',
        index: 1,
        width: 4,
        height: 2
      }, {
        type: 'appOverview',
        title: 'DASHBOARD.OVERVIEW.APPLICATIONS',
        index: 2,
        width: 4,
        height: 2
      }, {
        type: 'appOverview',
        title: 'DASHBOARD.OVERVIEW.APPLICATIONS2',
        index: 3,
        width: 4,
        height: 2
      }
    ];

    this.cards.sort((a, b) => {
      return a.index - b.index;
    });
  }

  onItemDrop(event) {
    _.each(this.cards, (card, index) => {
      card.index = index;
    })
  }
}

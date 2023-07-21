import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-discovery-dashboard',
  templateUrl: './discovery-dashboard.component.html'
})
export class DiscoveryDashboardComponent implements OnInit {

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
        width: 6,
        height: 2
      }
    ];

    this.cards.sort((a, b) => {
      return a.index - b.index;
    });
  }

}

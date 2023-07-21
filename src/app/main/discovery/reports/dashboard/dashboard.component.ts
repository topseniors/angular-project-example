import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportsService } from '../../../../services/apis/reports.service';

@Component({
  selector: 'app-discovery-reports-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DiscoveryReportsDashboardComponent implements OnInit {

  cards = [
    { title: "Scanned devices", route: "../scanneddevices" },
    { title: "Missing devices", route: "../missingdevices" },
    { title: "Cross reference reports"},
    { title: "Points to watch"},
    { title: "Collection issues"},
    { title: "Data integrity"},
    { title: "Cloud dependencies"}
  ];

  constructor(private reportsService: ReportsService, private router: Router) { }

  ngOnInit() {
    this.reportsService.mockedReportsSummary().subscribe((result:any) => {
      this.cards = this.cards.map((d,i) => {
        return {...result.data[i], ...d};
      })
    });
  }

}

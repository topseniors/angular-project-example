import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { NouisliderComponent } from 'ng2-nouislider';
import { AuditService } from '../../../services/audit.service';

const STATUS_OK = 'OK';
const STATUS_NOT_OK = 'NotOK';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(NouisliderComponent) chartSlider: NouisliderComponent;

  private tpsSubscription;
  private countsSubscription;
  private connectionStatusSubscription;
  ingestionTps = 0;
  esTps = 0;
  odbTps = 0;
  errorCount = 0;
  countStream;
  ingestionNodes = 0;
  ingestionRels = 0;
  ingestionStatus = null;
  esNodes = 0;
  esRels = 0;
  esStatus = null;
  orientNodes = 0;
  orientRels = 0;
  orientStatus = null;
  refreshingCounts = false;

  chartFilteringStarted = false;
  chartSliderTimeoutHandler: any;
  chartMin = 0;
  chartMax = 1;
  chartRange = [0, 1];
  originalChartData = [
    {
      data: [],
      label: 'Err/sec',
      fill: false
    },
    {
      data: [],
      label: 'Msg/sec',
      fill: false
    }
  ];
  chartData = [
    {
      data: [],
      label: 'Err/sec',
      fill: false
    },
    {
      data: [],
      label: 'Msg/sec',
      fill: false
    }
  ];
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    fill: false,
    legend: {
      position: 'bottom'
    },
    animation: {
      duration: 0
    },
    hover: {
      animationDuration: 0,
    },
    responsiveAnimationDuration: 0,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  originalChartLabels = [];
  chartLabels = [];
  chartColors = [
    {
      backgroundColor: '#f84a4a',
      borderColor: '#f84a4a',
      pointBackgroundColor: '#f84a4a',
      pointBorderColor: '#f84a4a',
      pointHoverBackgroundColor: '#f84a4a',
      pointHoverBorderColor: '#f84a4a'
    }, {
      backgroundColor: '#88c780',
      borderColor: '#88c780',
      pointBackgroundColor: '#88c780',
      pointBorderColor: '#88c780',
      pointHoverBackgroundColor: '#88c780',
      pointHoverBorderColor: '#88c780'
    }
  ];

  constructor(private auditService: AuditService) { }

  ngOnInit() {
    this.auditService.sessionTPS.forEach(t => this.processNewTps(t));
    this.tpsSubscription = this.auditService.tpsStream.subscribe(newTps => {
      if (newTps) {
        this.processNewTps(newTps);
      }
    });

    this.refreshCounts();
    this.connectionStatusSubscription = this.auditService.isAuditCountConnected$
      .subscribe(connected => {
        if (connected) {
          this.refreshCounts();
        }
      });

    this.countsSubscription = this.auditService.countStream.subscribe(counts => {
      if (counts && counts.tenantId) {
        this.refreshingCounts = false;
        if (counts.source === 'InternalState') {
          this.ingestionNodes = counts.counters.nodes;
          this.ingestionRels = counts.counters.relations;
          this.ingestionStatus = this.getStatusLabel(this.ingestionNodes, this.ingestionRels);
        }
        if (counts.source === 'ES') {
          this.esNodes = counts.counters.nodes;
          this.esRels = counts.counters.relations;
          this.esStatus = this.getStatusLabel(this.esNodes, this.esRels);
        }
        if (counts.source === 'OrientDB') {
          this.orientNodes = counts.counters.nodes;
          this.orientRels = counts.counters.relations;
          this.orientStatus = this.getStatusLabel(this.orientNodes, this.orientRels);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.chartSlider.slider.on('start', () => {
      this.chartFilteringStarted = true;
    });
  }

  ngOnDestroy() {
    this.connectionStatusSubscription.unsubscribe();
    this.countsSubscription.unsubscribe();
    this.tpsSubscription.unsubscribe();
  }

  getStatusLabel(nodesVal, relationshipsVal) {
    if (nodesVal === relationshipsVal) {
      return STATUS_OK;
    } else {
      return STATUS_NOT_OK;
    }
  }

  processNewTps(newTps) {
    if (newTps.ingestionTps || newTps.ingestionTps === 0) this.ingestionTps = parseFloat(newTps.ingestionTps.toFixed(2));
    if (newTps.esTps || newTps.esTps === 0) this.esTps = parseFloat(newTps.esTps.toFixed(2));
    if (newTps.odbTps || newTps.odbTps === 0) this.odbTps = parseFloat(newTps.odbTps.toFixed(2));
    if (newTps.errorCount || newTps.errorCount === 0) this.errorCount = parseFloat(newTps.errorCount.toFixed(2));
    const totalTPS = this.ingestionTps + this.esTps + this.odbTps;
    this.newDataPoint([newTps.errorCount, totalTPS], newTps.timestamp);
  }

  percentageValue(value: number): string {
    return value.toFixed(2) + ' msg/s';
  }

  newDataPoint(dataArr = [0], timestamp) {
    this.originalChartData.forEach((dataset, index) => {
      this.originalChartData[index] = Object.assign({}, this.originalChartData[index], {
        data: [...this.originalChartData[index].data, dataArr[index]]
      });
    });
    this.originalChartLabels = [...this.originalChartLabels, timestamp];

    this.chartMax = Math.max(this.originalChartLabels.length - 1, 1);
    setTimeout(() => {
      setTimeout(() => {
        if (!this.chartFilteringStarted) {
          this.chartRange = [this.chartMin, this.chartMax];
          this.chartSlider.slider.set(this.chartRange);
        }
      });
    });
  }

  onChartRangeChange(event) {
    if (this.chartSliderTimeoutHandler) {
      clearTimeout(this.chartSliderTimeoutHandler);
      this.chartSliderTimeoutHandler = null;
    }
    this.chartSliderTimeoutHandler = setTimeout(() => {
      const from = event[0];
      const to = event[1];
      this.chartData.forEach((dataset, index) => {
        this.chartData[index].data = this.originalChartData[index].data.slice(from, to + 1);
      });
      this.chartLabels = this.originalChartLabels.slice(from, to + 1);
    }, 1000);
  }

  onChartClick(event) { }

  refreshCounts() {
    this.refreshingCounts = true;
    this.auditService.refreshCounts();
  }
}

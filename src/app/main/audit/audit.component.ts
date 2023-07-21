import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';
import { AuditService } from '../../services/audit.service';
import { ToastrService } from '../../services/toastr.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.less']
})
export class AuditComponent implements OnInit, OnDestroy {
  title = 'Audit';
  tps = 0;
  startTime;
  elapsedTime;
  elapsedTicker;
  messageStream;
  countStream;

  constructor(
    private auditService: AuditService,
    private toastrService: ToastrService
  ) {
    this.onConnectionClose = this.onConnectionClose.bind(this);
  }

  ngOnInit(): void {
    this.startMonitoring();
  }

  startMonitoring() {
    this.auditService.clearSession();
    this.startTime = moment();
    this.elapsedTime = '00:00:00';
    this.elapsedTicker = Observable.interval(1000 * 1).subscribe(() => {
      this.elapsedTime = moment.utc(moment.duration(moment().diff(this.startTime)).asMilliseconds()).format('HH:mm:ss');
    });

    this.messageStream = this.auditService.connectAuditWebSocket(() => {
      this.auditService.startTpsMonitoring();
      this.messageStream.next({ tenantId: this.auditService.tenant });
    }, this.onConnectionClose);
    this.messageStream.subscribe(res => {
      this.auditService.onMessage(res.data);
    });

    this.countStream = this.auditService.connectAuditCountWebSocket(() => {
      this.auditService.refreshCounts();
      this.countStream.next({ tenantId: this.auditService.tenant });
      setTimeout(() => {
        this.auditService.isAuditCountConnected$.next(true);
      }, 1000);
    }, this.onConnectionClose);
    this.countStream.subscribe(res => {
      this.auditService.onCountMessage(res.data);
    });
  }

  onConnectionClose(error): void {
    this.stopMonitoring();
    if (error) {
      this.toastrService.show({ operationError: true, title: 'Error! Reconnecting...' });
      setTimeout(this.startMonitoring.bind(this), 5000);
    }
  }

  stopMonitoring() {
    this.elapsedTime = '0';
    this.elapsedTicker.unsubscribe();
    this.messageStream.unsubscribe();
    this.auditService.stopTpsMonitoring();
    this.auditService.disconnectAuditWebSocket();
    this.auditService.disconnectAuditCountWebSocket();
    this.auditService.isAuditCountConnected$.next(false);
  }

  ngOnDestroy() {
    this.stopMonitoring();
  }
}

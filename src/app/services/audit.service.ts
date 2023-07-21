import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
import { WebSocketService } from './websocket.service';
import { LoginService } from './apis/login.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuditService {

  private processedMessagesIngestion = 0;
  private processedMessagesOdb = 0;
  private processedMessagesEs = 0;
  private errorCount = 0;
  private auditCIs = [];

  public tenant = this.loginService.getUserData().orgOid;
  public sessionTPS = [];
  public tpsReporter = undefined;

  public isAuditCountConnected$ = new Subject<any>();

  private selectedAuditCISubject = new BehaviorSubject<any>('');
  public selectedAuditCIStream = this.selectedAuditCISubject.asObservable();

  private auditChangeSubject = new BehaviorSubject<any>('');
  public auditChangeStream = this.auditChangeSubject.asObservable();

  private customLogsSubject = new BehaviorSubject<any>('');
  public customLogsStream = this.customLogsSubject.asObservable();

  private tpsSubject = new BehaviorSubject<any>('');
  public tpsStream = this.tpsSubject.asObservable();

  private countSubject = new BehaviorSubject<any>('');
  public countStream = this.countSubject.asObservable();

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private loginService: LoginService
  ) {}

  public connectAuditWebSocket(onOpen, onClose): Subject<any> {
    const webSocketUrl = `${environment.webSocket.auditBase}?itscape-api-key=${this.authService.getToken()}`;
    return this.webSocketService.connect('audit', webSocketUrl, onOpen, onClose);
  }

  public disconnectAuditWebSocket(): void {
    this.webSocketService.disconnect('audit');
  }

  public connectAuditCountWebSocket(onOpen, onClose): Subject<any> {
    const webSocketUrl = `${environment.webSocket.auditBase}/counters?itscape-api-key=${this.authService.getToken()}`;
    return this.webSocketService.connect('auditCount', webSocketUrl, onOpen, onClose);
  }

  public disconnectAuditCountWebSocket(): void {
    this.webSocketService.disconnect('auditCount');
  }

  public refreshCounts() {
    this.webSocketService.send('auditCount', { tenantId: this.tenant });
  }

  public setSelectedAuditCI(auditCI) {
    this.selectedAuditCISubject.next(auditCI);
  }

  public onMessage(res) {
    let message: AuditChange = new AuditChange('', '', '', '', '', 0, '', '');
    message = Object.assign(message, JSON.parse(res));

    if (message.target === '') {
      message.target = 'Ingestion';
    }

    if (message.hasAllRequiredFields()) {
      if (message.target === 'Ingestion') {
        this.processedMessagesIngestion++;
      }
      if (message.target === 'ES') {
        this.processedMessagesEs++;
      }
      if (message.target === 'OrientDB') {
        this.processedMessagesOdb++;
      }
      if (message.isError()) {
        this.errorCount++;
      }
      this.processChange(message);
      this.customLogsSubject.next(message);
      this.auditChangeSubject.next(this.auditCIs);
    }
  }

  public onCountMessage(res) {
    this.countSubject.next(JSON.parse(res));
  }

  public processChange(auditChange: AuditChange) {
    if (auditChange.hasAllRequiredFields()) {
      let bucket = this.auditCIs.filter(a => a.oid === auditChange.oid && a.className === auditChange.className)[0];

      if (!bucket && auditChange.target === 'Ingestion') {
        bucket = new AuditCI(auditChange.tenantId, auditChange.jobRunId, auditChange.className, auditChange.oid);

        if (bucket.hasAllRequiredFields()) {
          this.auditCIs.push(bucket);
        }
      }

      if (bucket) {
        bucket.addEvent(auditChange);
      }

      if (bucket && this.isAuditCompleted(bucket)) {
        setTimeout(() => {
          const index = this.auditCIs.indexOf(bucket);
          this.auditCIs.splice(index, 1);
          this.auditChangeSubject.next(this.auditCIs);
        });
      }
    }
  }

  public isAuditCompleted(auditCI: AuditCI) {
    return auditCI.count() > 2 && auditCI.hasNoErrors();
  }

  public startTpsMonitoring() {
    this.processedMessagesIngestion = 0;
    this.processedMessagesOdb = 0;
    this.processedMessagesEs = 0;
    this.tpsReporter = Observable.interval(3000 * 1)
      .subscribe(() => {
        const tps = {
          ingestionTps: this.processedMessagesIngestion / 3,
          esTps: this.processedMessagesEs / 3,
          odbTps: this.processedMessagesOdb / 3,
          errorCount: this.errorCount / 3,
          timestamp: moment().format('HH:mm:ss')
        };
        this.tpsSubject.next(tps);
        this.sessionTPS.push(tps);
        this.processedMessagesIngestion = 0;
        this.processedMessagesOdb = 0;
        this.processedMessagesEs = 0;
      });
  }

  public stopTpsMonitoring() {
    if (this.tpsReporter) {
      this.tpsReporter.complete();
    }
  }

  public clearSession() {
    this.auditCIs = [];
    this.auditChangeSubject.next(this.auditCIs);
  }
}

export class AuditChange {
  tenantId: string;
  jobRunId: string;
  className: string;
  oid: string;
  changeType: string;
  timestamp: number;
  target: string;
  reason: string;

  constructor(
    tenantId: string,
    jobRunId: string,
    className: string,
    oid: string,
    changeType: string,
    timestamp: number,
    target: string,
    reason: string
  ) {
    this.tenantId = tenantId;
    this.jobRunId = jobRunId;
    this.className = className;
    this.oid = oid;
    this.changeType = changeType;
    this.timestamp = timestamp;
    this.target = target;
    this.reason = reason;
  }

  public isError() {
    return this.reason && this.reason.startsWith('ERROR:');
  }

  public isSuccess() {
    return !this.isError();
  }

  public hasAllRequiredFields() {
    return (this.tenantId !== '' && this.className !== '' && this.oid !== '' && this.target !== '');
  }
}

export class AuditCI {
  tenantId: string;
  jobRunId: string;
  className: string;
  oid: string;
  auditChanges = [];
  lastUpdate: string;

  constructor(tenantId: string, jobRunId: string, className: string, oid: string) {
    this.tenantId = tenantId;
    this.jobRunId = jobRunId;
    this.className = className;
    this.oid = oid;
    this.lastUpdate = moment().format('HH:mm:ss');
  }

  public addEvent(ac) {
    this.auditChanges.push(ac);
    this.lastUpdate = moment().format('HH:mm:ss');
  }

  public isEmpty() {
    return this.auditChanges.length === 0;
  }

  public count() {
    return this.auditChanges.length;
  }

  public changes() {
    return this.auditChanges;
  }

  public hasNoErrors() {
    const acWithErrors = this.auditChanges.filter(a => a.reason && a.reason !== '' && a.reason.startsWith('ERROR:'));
    return acWithErrors.length === 0;
  }

  public hasAllRequiredFields() {
    return (this.tenantId !== '' && this.className !== '' && this.oid !== '');
  }
}

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as moment from 'moment';
import { AuditService, AuditCI, AuditChange } from '../../../services/audit.service';
import { PAGE_AUDIT_EVENTS, UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent implements OnInit, OnDestroy {

  private auditSubscription;
  private selectedAuditSubscription;
  private logsSubscription;
  public auditCISelected = false;
  public showOnlyErrors = false;
  public tailOn = false;
  public auditCIs = [];
  public auditCIsOriginalLength = 0;
  public auditCI;
  public isCopied = false;
  public events = [];
  public ingestionCounts = 0;
  public elasticCounts = 0;
  public orientCounts = 0;
  public desirableContentPanelHeight = 0;
  private resizeTimeoutHandler: any;

  constructor(private auditService: AuditService, private utilsService: UtilsService) {}

  ngOnInit() {
    this.desirableContentPanelHeight = this.utilsService.getDesirableContentPanelHeight(PAGE_AUDIT_EVENTS);
    this.auditSubscription = this.auditService.auditChangeStream.subscribe(newBuckets => {
      if (newBuckets) {
        let auditChanges = null;
        let auditChange = null;
        this.ingestionCounts = 0;
        this.elasticCounts = 0;
        this.orientCounts = 0;

        this.auditCIsOriginalLength = newBuckets.length;
        for (let i = 0; i < newBuckets.length; i++) {
          auditChanges = newBuckets[i].changes();
          for (let j = 0; j < auditChanges.length; j++) {
            auditChange = auditChanges[j];
            const { target } = auditChange;
            if (target === 'Ingestion') {
              this.ingestionCounts++;
            } else if (target === 'ES') {
              this.elasticCounts++;
            } else if (target === 'OrientDB') {
              this.orientCounts++;
            }
          }
        }
        this.auditCIs = newBuckets.slice(0, 20);
      }
    });
    this.selectedAuditSubscription = this.auditService.selectedAuditCIStream.subscribe(res => {
      if (res) {
        this.auditCI = res;
        this.isCopied = false;
      }
    });
    this.logsSubscription = this.auditService.customLogsStream.subscribe(customLogs => {
      if (customLogs) {
        if (this.events.length > 60) {
          this.events.shift();
        }
        if (customLogs.oid) {
          this.events.push(customLogs);
        }
        if (this.tailOn) {
          this.updateLogsScroll();
        }
      }
    });
  }

  ngOnDestroy() {
    this.auditSubscription.unsubscribe();
    this.selectedAuditSubscription.unsubscribe();
    this.logsSubscription.unsubscribe();
  }

  getAuditChangeTargetLabel(target) {
    if (target === 'Ingestion') {
      return 'Ingestion';
    } else if (target === 'ES') {
      return 'Elastic Search';
    } else if (target === 'OrientDB') {
      return 'OrientDB';
    }

    return null;
  }

  select(auditCI) {
    this.auditCISelected = true;
    this.auditService.setSelectedAuditCI(auditCI);
  }

  closeSelectedAuditCIInfo() {
    this.auditCISelected = false;
    this.auditCI = null;
  }

  isSuffixPlus(auditChange) {
    const { changeType } = auditChange;

    return (changeType.substring(0, 3) === 'new');
  }

  isSuffixO(auditChange) {
    const { changeType } = auditChange;

    return (changeType.substring(0, 6) === 'update' || changeType.substring(0, 5) === 'merge');
  }

  isSuffixMinus(auditChange) {
    const { changeType } = auditChange;

    return (changeType.substring(0, 6) === 'delete');
  }

  getClassForChange(auditChange) {
    const classList = [];
    const { target, changeType } = auditChange;

    if (auditChange.isError()) {
      return 'event-column-error event-column-striped';
    }

    if (target === 'Ingestion') {
      classList.push('event-column-ingestion');
    } else if (target === 'ES') {
      classList.push('event-column-es');
    } else if (target === 'OrientDB') {
      classList.push('event-column-orient');
    }

    if (changeType.substring(0, 3) === 'new') {
      classList.push('event-column-new');
    } else if (changeType.substring(0, 6)  === 'update') {
      classList.push('event-column-update');
    } else if (changeType.substring(0, 6) === 'delete') {
      classList.push('event-column-delete');
    } else {
      classList.push('event-column-default');
    }

    return classList.join(' ');
  }

  getRightSubPanelHeight(): number {
    return (!this.auditCI) ? this.desirableContentPanelHeight : this.desirableContentPanelHeight / 2;
  }

  updateLogsScroll() {
    const objDiv = document.getElementsByClassName('console-log')[0];
    objDiv.scrollTop = objDiv.scrollHeight + 10;
  }

  timestamp(eventTime) {
    return moment(eventTime).format('h:mm:ss');
  }

  getNow() {
    return moment().format('h:mm:ss');
  }

  isAuditChange(event) {
    return event instanceof AuditChange;
  }

  isCustomLogChange(event) {
    return event instanceof String;
  }

  clearAll() {
    this.events = [];
  }

  toggleShowOnlyErrors() {
    this.showOnlyErrors = !this.showOnlyErrors;
  }

  toggleTail() {
    this.tailOn = !this.tailOn;
  }

  @HostListener('window:resize', ['$event']) onResize(event): void {
    if (this.resizeTimeoutHandler) {
      clearTimeout(this.resizeTimeoutHandler);
      this.resizeTimeoutHandler = null;
    }
    this.resizeTimeoutHandler = setTimeout(() => {
      this.desirableContentPanelHeight = this.utilsService.getDesirableContentPanelHeight(PAGE_AUDIT_EVENTS);
      this.resizeTimeoutHandler = null;
    }, 1500);
  }
}

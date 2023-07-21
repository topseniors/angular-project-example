import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { ApiService, APIResult, StringableMap } from './api.service';
import { GlobalStorageService } from '../global-storage.service';
import { ToastrService } from 'app/services/toastr.service';
import { ProgressChannel, ProgressData } from '../../components/progress-bar/progress-bar.component';
import Utils from '../../utils';
import { ORG_OID } from './login.service';

export type ScanJobsAPIResult<T> = APIResult<T>;

export interface RescanPayload {
  addresses: string;
}

@Injectable()
export class ScanJobsService {

  constructor(
    private apiService: ApiService,
    private toastrService: ToastrService,
    private storage: GlobalStorageService
  ) { }

  public getScanJob(scanJobId: string): Observable<ScanJob> {
    const uri = 'scanjobs/' + this.storage.getLocal(ORG_OID) + ':ScanJob:' + scanJobId;
    return this.apiService.callApi('GET', uri)
      .map(result => result.data)
      .map(Coercer.scanJob).share();
  }

  public getScanJobs(searchParams?: ScanJobSearchParams): Observable<ScanJobsAPIResult<ScanJob>> {
    const uri = 'scanjobs';
    return this.apiService.callApi('GET', uri, searchParams)
      .do(result => result.data = result.data.map(Coercer.scanJob))
      .share();
  }

  public getScanJobRuns(scanJobId: string): Observable<ScanJobsAPIResult<ScanJobRun>> {
    const uri = `jobs/${scanJobId}/runs`;
    return this.apiService.callApi('GET', uri)
      .do(result => result.data = result.data.map(Coercer.scanJobRun))
      .share();
  }

  public getScanJobRunLogs(scanJobRunId: string, searchParams: IngestionMetricsSearchParams) {
    const oldUri = this.apiService.apiPath;
    this.apiService.apiPath = '/';
    const uri = `scanstatus/ingestion-metrics/${scanJobRunId}`;
    const result = this.apiService.callApi('GET', uri, searchParams).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getScanJobRunResult(scanJobRunId: string, searchParams: IngestionMetricsSearchParams) {
    const oldUri = this.apiService.apiPath;
    this.apiService.apiPath = '/';
    const uri = `scanstatus/findings/${scanJobRunId}`;
    const result = this.apiService.callApi('GET', uri, searchParams).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public rescan(scanJobId: string, payload: RescanPayload): Observable<ScanJob> {
    const uri = `scanjobs/${scanJobId}/ops/startsubscan`;

    return this.apiService.callApi('POST', uri, payload)
      .do(result => this.toastrService.show(null, result))
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .map(Coercer.scanJob)
      .share();
  }

  public start(scanJobId: string): Observable<ScanJob[]> {
    const params = {};
    const uri = `jobs/${scanJobId}/ops/start`;
    return this.apiService.callApi('POST', uri, params)
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .map(c => c.map(Coercer.scanJob))
      .share();
  }

  public stop(scanJobId: string): Observable<ScanJob[]> {
    const params = {};
    const uri = `jobs/${scanJobId}/ops/abort`;
    return this.apiService.callApi('POST', uri, params)
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .map(c => c.map(Coercer.scanJob))
      .share();
  }

  public abort(scanJobId: string): Observable<ScanJob[]> {
    const params = {};
    const uri = `jobs/${scanJobId}/ops/doabort`;
    return this.apiService.callApi('POST', uri, params)
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .map(c => c.map(Coercer.scanJob))
      .share();
  }

  public clone(scanJobId: string, cloneName: string): Observable<ScanJob> {
    const params = { id: scanJobId, name: cloneName };
    const uri = `scanjobs/${scanJobId}/ops/clone`;
    return this.apiService.callApi('POST', uri, params)
      .do(result => this.toastrService.show(null, result))
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .map(Coercer.scanJob)
      .share();
  }

  public delete(scanJobId: string): Observable<{ message: string }> {
    const params = {};
    const uri = `jobs/${scanJobId}`;
    return this.apiService.callApi('DELETE', uri, params)
      .do(result => this.toastrService.show(null, result))
      .map(result => {
        if (!result.success) throw result.msg;
        else return result.data;
      })
      .share();
  }
}

/** API TYPES SECTION */

export interface ScanJobSearchParams extends StringableMap {
  start?: number;
  limit?: number;
  $filter?: string; // 'name=='*abc*''
  $orderby?: string; // 'name asc'
}
// ScanJobRun backend doesn't seem to support any paging/sorting/filtering

export interface IngestionMetricsSearchParams extends StringableMap {
  from?: number;
  pageSize?: number;
  orderBy?: string;
  orderDir?: string; // 'asc' | 'desc';
}

/** RAW TYPES SECTION */

interface RawScanJobCommon {
  endCode: string;
  progressMsg: string;
  resultData: string;
  opState: string;
  started: string;
  creationDate: number;
  enableCM: string;
  endMsg: string;
  modificationDate: number;
  shortDescr: string;
  ended: string;
  name: string;
  progress: string;
  perfMonitoring: string;
  id: string;
};

type RawScanJobRun = RawScanJobCommon & {
  orgOid: string;
  className: 'ScanJobRun';
  oid: string;
  orgId: string;
  submitedSeqNb: string;
  executionSeqNb: string;
};

type RawScanJob = RawScanJobCommon & {
  hasExcludeScope: boolean;
  scopesConfigOK: boolean;
  isTemporary: string;
  scanAllCloudInstances: string;
  confState: string;
  jobApplianceId: string;
  eScopesConfigOK: boolean;
  confErrorReason: string;
  hasKeychain: boolean;
  eScopesNames: string;
  hasAppliance: string;
  hasBoundaryScope: boolean;
  nextFire: string;
  hasSchedule: string;
  jobScheduleIds: string;
  scanApplianceType: string;
  hasScope: boolean;
  bScopesNames: string;
  kcNames: string;
  jobApplianceName: string;
  scopesNames: string;
  kcConfigOK: boolean;
  bScopesConfigOK: boolean;
  scanType: string;
  isTransient: string;
  maxDuration: string;
  lastJobRunId: string;
  scanLocationId: string;
  scanLocationName: string;
};

/** COERCED TYPES SECTION */

export type EndCode = 'OK' | 'AbortedByUser';
export type OpState = 'Unknown' | 'Idle' | 'Running' | 'Paused' | 'Queued' | 'Aborted' | 'WaitingInput' |
  'CompletedNOK' | 'Ended' | 'Starting' | 'Aborting' | 'Resuming' | 'Pausing';
export type ProgressMsg = 'aborted' | [number, number, number];
export type ApScoutId = [string, string, string];
export type ScanStatus = 'Success' | 'SystemDetected' | 'Unknown' | 'InsufficientPrivilege' | 'ScanFailure' | 'NoAnswer' | 'Missing' |
  'CredentialFailed' | 'CredentialNoLongerWork' | 'NoConnection' | 'NoCredential' | 'ConnectionFailed' | 'Warning' |
  'SkippedAsExcluded' | 'SkippedAsSameAs' | 'SkippedAsBetterMethodExist' | 'SkippedAsWorkStation';
export interface ResultData {
  total: number;
  current: number;
  counters?: {[scanStatus in ScanStatus]?: number};
};
export type ScanType = 'Sequential' | 'Credentialess' | 'SpiralApp' | 'SpiralAll';
export type ConfState = 'OK' | 'Incomplete';
export type ScanApplianceType = 'Standard' | 'AmazonEC2';
export type PerfMonitoring = 'enableUtility' | 'NoActionUtility';

interface ScanJobCommon {
  endCode: EndCode;
  progressMsg: ProgressMsg;
  resultData: ResultData;
  opState: OpState;
  started: number;
  creationDate: number;
  enableCM: boolean;
  endMsg: string;
  modificationDate: number;
  shortDescr: string;
  ended: number;
  name: string;
  progress: number;
  perfMonitoring: PerfMonitoring;
  id: ApScoutId;
};

export type ScanJobRun = ScanJobCommon & {
  orgOid: string;
  className: 'ScanJobRun';
  oid: string;
  orgId: ApScoutId;
  submitedSeqNb: number;
  executionSeqNb: number;
};

export type ScanJob = ScanJobCommon & {
  hasExcludeScope: boolean;
  scopesConfigOK: boolean;
  isTemporary: boolean;
  scanAllCloudInstances: boolean;
  confState: ConfState;
  jobApplianceId: ApScoutId;
  eScopesConfigOK: boolean;
  confErrorReason: string;
  hasKeychain: boolean;
  eScopesNames: string;
  hasAppliance: boolean;
  hasBoundaryScope: boolean;
  nextFire: number;
  hasSchedule: boolean;
  jobScheduleIds: ApScoutId;
  scanApplianceType: ScanApplianceType;
  hasScope: boolean;
  bScopesNames: string;
  kcNames: string;
  jobApplianceName: string;
  scopesNames: string;
  kcConfigOK: boolean;
  bScopesConfigOK: boolean;
  scanType: ScanType;
  isTransient: boolean;
  maxDuration: number;
  lastJobRunId: ApScoutId;
  scanLocationId: ApScoutId;
  scanLocationName: string;
};

/** DATA COERCER SECTION */

class Coercer {
  private static progressMsg(progressMsg: string): ProgressMsg {
    if (progressMsg === '') return undefined;
    if (progressMsg === 'aborted') return 'aborted';
    return <ProgressMsg>progressMsg.split(':').slice(1, 4).map(Utils.string2number);
  }
  private static resultData(resultData: string): ResultData {
    return (resultData === '') ? undefined : JSON.parse(resultData);
  }
  private static apScoutId(apScoutId: string): ApScoutId {
    return (apScoutId === '') ? undefined : <ApScoutId>apScoutId.split(':');
  }
  public static scanJobRun(raw: RawScanJobRun): ScanJobRun {
    return <ScanJobRun>_.mapValues(raw, (v, k) => {
      if (typeof v === 'string') v = v.trim(); // because who needs whitespaces...
      switch (k) {
        case 'resultData':
          return Coercer.resultData(<string>v);
        case 'enableCM':
          return (v === '') ? undefined : Utils.string2boolean(<string>v);
        case 'orgId':
        case 'id':
          return Coercer.apScoutId(<string>v);
        case 'progressMsg':
          return Coercer.progressMsg(<string>v);
        case 'started':
        case 'submitedSeqNb':
        case 'executionSeqNb':
        case 'ended':
        case 'progress':
          return (v === '') ? undefined : Utils.string2number(<string>v);
        default:
          return v;
      }
    });
  }
  public static scanJob(raw: RawScanJob): ScanJob {
    return <ScanJob>_.mapValues(raw, (v, k) => {
      if (typeof v === 'string') v = v.trim(); // because who needs whitespaces...
      switch (k) {
        case 'resultData':
          return Coercer.resultData(<string>v);
        case 'isTemporary':
        case 'enableCM':
        case 'scanAllCloudInstances':
        case 'hasAppliance':
        case 'hasSchedule':
        case 'isTransient':
          return (v === '') ? undefined : Utils.string2boolean(<string>v);
        case 'jobApplianceId':
        case 'id':
        case 'jobScheduleIds':
        case 'lastJobRunId':
        case 'scanLocationId':
          return Coercer.apScoutId(<string>v);
        case 'progressMsg':
          return Coercer.progressMsg(<string>v);
        case 'nextFire':
        case 'started':
        case 'ended':
        case 'progress':
        case 'maxDuration':
          return (v === '') ? undefined : Utils.string2number(<string>v);
        default:
          return v;
      }
    });
  }
}

/** DATA TRANSFORMS SECTION */

export type StatusIcon = 'blank' | 'in-progress' | 'queued' | 'user-aborted' | 'success';
export type StatusEffect = 'blinking' | 'spinning';
export type TypeIcon = 'blank' | 'credentialess' | 'sequential' | 'spiralapp' | 'spiralall';

export class Transforms {
  // progress transform area

  private static readonly progressMap = {
    'noanswer': 'NoAnswer',
    'NoAnswer': 'NoAnswer',
    'systemdetected': 'Success',
    'SystemDetected': 'Success',
    'success': 'Success',
    'Success': 'Success',
    'unknown': 'NotScanned',
    'Unknown': 'NotScanned',
    'insufficientpriviliege': 'NotScanned',
    'InsufficientPriviliege': 'NotScanned',
    'scanfailure': 'NotScanned',
    'ScanFailure': 'NotScanned',
    'credentialfailed': 'NotScanned',
    'CredentialFailed': 'NotScanned',
    'credentialnolongerwork': 'NotScanned',
    'CredentialNoLongerWork': 'NotScanned',
    'noconnection': 'NotScanned',
    'NoConnection': 'NotScanned',
    'nocredential': 'NotScanned',
    'NoCredential': 'NotScanned',
    'connectionfailed': 'NotScanned',
    'ConnectionFailed': 'NotScanned',
    'skippedasexcluded': 'Skipped',
    'SkippedAsExcluded': 'Skipped',
    'skippedassameas': 'Skipped',
    'SkippedAsSameAs': 'Skipped',
    'skippedasbettermethodexist': 'Skipped',
    'SkippedAsBetterMethodExist': 'Skipped',
    'skippedasworkstation': 'Skipped',
    'SkippedAsWorkStation': 'Skipped',
    'warning': 'PointsToWatch',
    'Warning': 'PointsToWatch'
  };
  private static readonly progressGroupNameMap = {
    'Unknown': 'Unknown',
    'NoAnswer': 'No Answer',
    'Success': 'Success',
    'NotScanned': 'Not Scanned',
    'Skipped': 'Skipped',
    'PointsToWatch': 'Points To Watch'
  };
  private static readonly progressGroupColorMap = {
    'Unknown': '#ffff00',
    'NoAnswer': '#777777',
    'Success': '#88c780',
    'NotScanned': '#f84a4a',
    'Skipped': '#61c3ff',
    'PointsToWatch': '#ff840b'
  };
  private static readonly colorOrder = ['#ffff00', '#777777', '#88c780', '#f84a4a', '#61c3ff', '#ff840b'];

  public static getColor(status: string): string {
    return Transforms.progressGroupColorMap[Transforms.progressMap[status]] || '#ffff00';
  }

  private static getColorIndex(d: ProgressChannel) {
    return Transforms.colorOrder.indexOf(d.color);
  }

  private static colorSort(a: ProgressChannel, b: ProgressChannel) {
    return Transforms.getColorIndex(a) - Transforms.getColorIndex(b);
  }

  public static progressTransform(index: number, row: ScanJob | ScanJobRun): ProgressData {
    if (!row.resultData) return undefined;
    const total: number = row.resultData.total;
    const progress: number = row.progress;
    let foundIndex: number = null;
    const channels: ProgressChannel[] = _.entries(row.resultData.counters)
      .reduce((grouped: any, [name, count]) => {
        foundIndex = grouped.findIndex((iterator: ProgressChannel) => iterator.key === (Transforms.progressMap[name] || 'Unknown'));
        if (foundIndex > -1) {
          grouped[foundIndex].count += count;
        } else {
          grouped.push({
            key: Transforms.progressMap[name] || 'Unknown',
            name: Transforms.progressGroupNameMap[Transforms.progressMap[name]] || 'Unknown',
            color: Transforms.getColor(name),
            count
          });
        }
        return grouped;
      }, [])
      .sort(Transforms.colorSort);

    return { total, progress, channels };
  }

  public static statusIconTransform(i: number, row: ScanJob | ScanJobRun): StatusIcon {
    switch (row.opState) {
      case 'Starting':
      case 'Running':
        return 'in-progress';

      case 'Queued':
        return 'queued';

      case 'Aborting':
      case 'Aborted':
        return 'user-aborted';

      case 'Ended':
        if (row.endCode === 'AbortedByUser') return 'user-aborted';
        return 'success';

      default:
        return 'blank';
    }
  }

  public static statusEffectTransform(i: number, row: ScanJob | ScanJobRun): StatusEffect {
    switch (row.opState) {
      case 'Starting':
      case 'Aborting':
        return 'blinking';

      case 'Running':
        return 'spinning';

      default:
        return undefined;
    }
  }

  public static typeIconTransform(i: number, row: ScanJob): TypeIcon {
    switch (row.scanType) {
      case 'Credentialess':
        return 'credentialess';
      case 'Sequential':
        return 'sequential';
      case 'SpiralApp':
        return 'spiralapp';
      case 'SpiralAll':
        return 'spiralall';
      default:
        return 'blank';
    }
  }
}

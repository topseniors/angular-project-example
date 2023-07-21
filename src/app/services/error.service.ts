import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { GlobalStorageService } from './global-storage.service';

const ERRORS_LOCAL_STORAGE_KEY = 'applicationErrors';
const ERROR_KEY_SEPARATOR = '::';

const errorCodeDescription = {
  '304': 'Not Modified - There is no need to retransmit the requested resources',
  '400': 'Bad Request - The server could not understand the request due to invalid syntax',
  '403': 'Forbidden - The server understood the request but refuses to authorize it',
  '404': 'Not Found - The server can\'t find the requested resource',
  '500': 'Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request',
  '502': 'Bad Gateway - The server, while acting as a gateway or proxy, received an invalid response from the upstream server',
  '503': 'Service Unavailable - The server is not ready to handle the request'
};

export interface ErrorEntry {
  id: string;
  url: string;
  status: number;
  statusDescription?: string;
  timestamp: number;
  numberOfOccurrences: number;
}

export interface ErrorLogResult {
  total: number;
  data: ErrorEntry[];
}

@Injectable()
export class ErrorService {

  constructor (private storage: GlobalStorageService) { }

  buildErrorKey({url, status}): string {
    return `${url}${ERROR_KEY_SEPARATOR}${status}`;
  }

  public add({url, status}): void {
    const timestamp = +new Date();
    const errors = this.storage.getLocal(ERRORS_LOCAL_STORAGE_KEY) || [];
    const id  = this.buildErrorKey({url, status});
    const foundIndex = _.findIndex(errors, { id });
    if (foundIndex < 0) {
      errors.push({ id, url, status, timestamp, numberOfOccurrences: 1 });
    } else {
      errors[foundIndex].numberOfOccurrences += 1;
      errors[foundIndex].timestamp = timestamp;
    }
    this.storage.storeLocal(ERRORS_LOCAL_STORAGE_KEY, errors);
  }

  public flush(): Observable<ErrorLogResult> {
    this.storage.removeLocal(ERRORS_LOCAL_STORAGE_KEY);
    const errorLog = {
      total: 0,
      data: []
    };
    return Observable.of(errorLog).share();
  }

  public getAll(): Observable<ErrorLogResult> {
    let errors = this.storage.getLocal(ERRORS_LOCAL_STORAGE_KEY) || [];
    errors = errors.map(error => ({ ...error, statusDescription: errorCodeDescription[error.status.toString()] }));
    const errorLog = {
      total: errors.length,
      data: errors
    };
    return Observable.of(errorLog).share();
  }
}

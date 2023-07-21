import { Injectable } from '@angular/core';
import { ApiService, APIResult, StringableCollection } from './api.service';
import { Observable } from 'rxjs/Rx';
import { ToastrService } from '../toastr.service';

export const SEARCH_MODE_REGULAR = 'Regular';
export const SEARCH_MODE_DSL = 'DSL';
export type APIResult<T> = APIResult<T>;
export type StringableCollection = StringableCollection;
export type SearchAPIResult<T> = APIResult<T> & {
  facetFields?: any,
  remaining?: number
};
export interface SaveSearchPayload {
  data: {
    id?: string;
    entity: string;
    folderId: string;
    name: string;
    q: string;
    searchMode?: string;
    shortDescr: string;
  };
}

export interface SaveFolderPayload {
  data: {
    id?: string;
    name: string;
    shortDescr: string;
    type?: string;
    mode?: string;
  };
}

@Injectable()
export class SearchService {

  constructor(
    private toastrService: ToastrService,
    private apiService: ApiService
  ) { }

  public getCIs(searchParams?: StringableCollection): Observable<SearchAPIResult<CIWrapper>> {
    let method, uri, paramsData;
    const { searchMode, from, pageSize } = searchParams[0];

    if (searchMode === SEARCH_MODE_REGULAR) {
      method = 'GET';
      uri = 'ci-search';
      delete searchParams[0].searchMode;
      paramsData = searchParams;
    } else {
      method = 'POST';
      uri = `ci-search/raw?from=${from}&pageSize=${pageSize}`;
      paramsData = {
        // TODO: Put request payload here!
      };
    }

    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi(method, uri, paramsData).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getSearchKeywords(searchParams?: StringableCollection): Observable<string[]> {
    const uri = `ci-search/autocomplete`;
    const oldUri = this.apiService.apiPath;

    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri, searchParams)
      .map(res => res.data)
      .share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getFolders(): Observable<APIResult<Folder>> {
    const uri = `folders`;
    const params = {
      $filter: 'type==\'Search\'',
      query: '',
      start: 0
    };

    return this.apiService.callApi('GET', uri, params).share();
  }

  public getFoldersWithTree(): Observable<Folder[]> {
    const uri = `folders/tree`;
    const params = {
      $filter: 'type==\'Search\'',
      node: 'root',
      id: 'root'
    };

    return this.apiService.callApi('GET', uri, params).share();
  }

  public createFolder(payload: SaveFolderPayload): Observable<APIResult<Folder>> {
    const uri = `folders`;

    return this.apiService.callApi('POST', uri, payload)
      .do((result: APIResult<Folder>) => (this.toastrService.show(null, result)))
      .share();
  }

  public updateFolder(payload: SaveFolderPayload): Observable<APIResult<Folder>> {
    const uri = `folders/${payload.data.id}`;

    return this.apiService.callApi('PUT', uri, payload)
      .do((result: APIResult<Folder>) => (this.toastrService.show(null, result)))
      .share();
  }

  public deleteFolder(id: string): Observable<APIResult<any>> {
    const uri = `folders/${id}`;

    return this.apiService.callApi('DELETE', uri)
      .do((result: APIResult<any>) => (this.toastrService.show(null, result)))
      .share();
  }

  public getFolderSearches(folderId: string): Observable<APIResult<Search>> {
    const uri = `folders/${folderId}/searches`;

    return this.apiService.callApi('GET', uri).share();
  }

  public createSearch(payload: SaveSearchPayload): Observable<APIResult<Search>> {
    const uri = `searches`;

    return this.apiService.callApi('POST', uri, payload)
      .do(result => this.toastrService.show(null, result))
      .share();
  }

  public updateSearch(payload: SaveSearchPayload): Observable<APIResult<Search>> {
    const uri = `searches/${payload.data.id}`;

    return this.apiService.callApi('PUT', uri, payload)
      .do(result => this.toastrService.show(null, result))
      .share();
  }

  public deleteSearch(id: string): Observable<APIResult<Search>> {
    const uri = `searches/${id}`;

    return this.apiService.callApi('DELETE', uri)
      .do(result => this.toastrService.show(null, result))
      .share();
  }

  public deleteSearches(ids: string[]): Observable<APIResult<any>> {
    const uri = `searches/ops/deletemultiple`;
    const params = { ids };

    return this.apiService.callApi('POST', uri, params)
      .do(result => this.toastrService.show(null, result))
      .share();
  }
}

export type EntityType = 'ProductInstance'|'ComputerSystem'|'Container'|'SystemProcessList'|
  'PIGroup'|'UnqualifiedPI'|'NetworkDevice'|'StorageDevice'|'UnqualifiedPIGroup'|'SWCluster'|
  'Application'|'BusinessService'|'Service'|'SystemProcessCxList';

export interface CIWrapper {
  result: CI;
  highlight: any;
};

export interface CI {
  className: EntityType;
  oid: string;
  systemClassName?: string;
  systemOid?: string;
  systemDescr?: string;
  systemType?: string;
  shortDescr?: string;
  type?: string;
  model?: string;
  name?: string;
  hostName?: string;
  VMName?: string;
  manufacturer?: string;
  description?: string;
  highlight?: string;
  serverCount?: number;
  piCount?: number;
  upiCount?: number;
  OSFamily?: string;
  OSModel?: string;
  OSVersion?: string;
  containerName?: string;
  containerTechnology?: string;
  IPAddressList?: string;
  processList?: any;
  cxList?: any;
  lastScanDate?: number;
  creationDate?: number;
  modificationDate?: number;
  expirationDate?: number;
};

export interface Folder {
  className: 'Folder';
  createdBy: string;
  createdByName: string;
  creationDate: number;
  dsRefs?: string[];
  id: string;
  modificationDate: number;
  modifiedBy: string;
  modifiedByName: string;
  name: string;
  oid: string;
  orgId: string;
  orgOid: string;
  permissions: string;
  permissionsLabel: string;
  shortDescr: string;
  type: 'Search';
  usRefs?: string[];
  active?: boolean;
}

export interface Search {
  className: 'Search';
  createdBy: string;
  createdByName: string;
  creationDate: number;
  entity: string;
  folderId: string;
  folderName?: string;
  id: string;
  modificationDate: number;
  modifiedBy: string;
  modifiedByName: string;
  name: string;
  oid: string;
  orgId: string;
  orgOid: string;
  permissions: string;
  permissionsLabel: string;
  q: string;
  searchMode?: string;
  shortDescr: string;
}

export type EntityTypeIcon = 'Default'|'ProductInstance'|'ComputerSystem'|'Container'|'SystemProcessList'|
  'PIGroup'|'UnqualifiedPI'|'NetworkDevice'|'StorageDevice'|'UnqualifiedPIGroup'|
  'SWCluster'|'Application'|'BusinessService'|'Service'|'SystemProcessCxList'; // Put Icon types here

export class Transforms {
  public static entityTypeIconTransform(i: number, row: any): EntityTypeIcon {
    switch (row.className) {
      case 'ProductInstance':
        return 'ProductInstance';
      case 'ComputerSystem':
        return 'ComputerSystem';
      case 'Container':
        return 'Container';
      case 'SystemProcessList':
        return 'SystemProcessList';
      case 'PIGroup':
        return 'PIGroup';
      case 'UnqualifiedPI':
        return 'UnqualifiedPI';
      case 'NetworkDevice':
        return 'NetworkDevice';
      case 'StorageDevice':
        return 'StorageDevice';
      case 'UnqualifiedPIGroup':
        return 'UnqualifiedPIGroup';
      case 'SWCluster':
        return 'SWCluster';
      case 'Application':
        return 'Application';
      case 'BusinessService':
        return 'BusinessService';
      case 'Service':
        return 'Service';
      case 'SystemProcessCxList':
        return 'SystemProcessCxList';
      default:
        return 'Default';
    }
  }
}

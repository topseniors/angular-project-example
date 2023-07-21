import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GlobalStorageService } from '../global-storage.service';
import * as _ from 'lodash';

@Injectable()
export class GraphService {

  constructor(private apiService: ApiService, private storage: GlobalStorageService) { }

  public getGraph(url) {
    let params = {
      getRefs: true
    }

    let uri = url.substr(1);
    return this.apiService.callApi('GET', uri, params);
  }

  public parseNodes(nodes: any[]) {
    return _.map(nodes, (node) => {
      return {
        "id": node.id,
        "name": node.shortDescr
      }
    })
  }

  public parseEdges(edges: any[]) {
    return _.map(edges, (edge) => {
      return {
        "from": edge.usRef,
        "to": edge.dsRef
      }
    })
  }

}

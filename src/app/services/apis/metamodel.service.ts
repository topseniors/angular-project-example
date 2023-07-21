import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Rx';

export interface AttributeAtomElement {
  name: string;
  value: string;
}
export interface FieldElement {
  attributes: AttributeAtomElement[];
  _type: string;
  constraint?: {
    name: string;
    minValue: number;
    maxValue: number;
  };
}
export interface MetamodelClassFieldsAPIResult {
  attributes: AttributeAtomElement[];
  fields: FieldElement[];
}
export interface MetamodelClassesAPIResult {
  attributes: AttributeAtomElement[];
  classes: MetamodelClassFieldsAPIResult[];
}

@Injectable()
export class MetamodelService {

  constructor(private apiService: ApiService) { }

  public getMetamodelClasses(): Observable<MetamodelClassesAPIResult> {
    const uri = `metamodel`;
    const oldUri = this.apiService.apiPath;
    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri).share();
    this.apiService.apiPath = oldUri;

    return result;
  }

  public getMetamodelClassFields(className: string): Observable<MetamodelClassFieldsAPIResult> {
    const uri = `metamodel/${className}`;
    const oldUri = this.apiService.apiPath;
    this.apiService.apiPath = '';
    const result = this.apiService.callApi('GET', uri).share();
    this.apiService.apiPath = oldUri;

    return result;
  }
}

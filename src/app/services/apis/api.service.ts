import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpParameterCodec } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';

/** Used for backend pagination when we need to know the total size of the collection */
export interface APIResult<R> { data?: R[]|R|any; total?: number; success?: boolean; msg?: string; message?: string; messages?: string[]; }
export type Stringable = string|number|boolean|any;
export interface StringableMap { [key: string]: Stringable; }
export type StringableCollection = StringableMap|StringableMap[];

class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

@Injectable()
export class ApiService {
  private envPath = environment.envPath;
  public apiPath = environment.apiPath;
  public org = '';
  public token = '';

  constructor(private http: HttpClient) { }

  public callApi(
    method: string,
    uri: string,
    data: StringableCollection = null,
    requestOptions: any = null,
    asHttpParams: boolean = false
  ): Observable<any> {

    const finalUrl = this.envPath + (uri.indexOf(this.apiPath) === -1 ? this.apiPath : '') + uri;
    const contentType = (requestOptions && requestOptions.contentType) ? requestOptions.contentType : 'application/json';
    const headers = new HttpHeaders().set('Content-Type', contentType);
    const params = this.convertToHttpParams(data);
    const options = (method === GET) ? { headers, params } : { headers };

    switch (method) {
      case GET:
        return this.http.get(finalUrl, options).share();
      case POST:
        return this.http.post(finalUrl, (asHttpParams) ? params : data, options).share();
      case PUT:
        return this.http.put(finalUrl, (asHttpParams) ? params : data, options).share();
      case DELETE:
        return this.http.delete(finalUrl, options).share();
      default:
        return this.http.get(finalUrl).share();
    }
  }

  private convertToHttpParams(data: StringableCollection): HttpParams {
    let httpParams = new HttpParams({ encoder: new CustomEncoder() });
    if (_.isObject(data)) {
      if (_.isArray(data)) {
        data.forEach(d => {
          _.entries(d).forEach(([key, value]) => {
            if (!_.isUndefined(value)) {
              httpParams = httpParams.append(key, value.toString());
            }
          });
        });
      } else return this.convertToHttpParams([data]);
    }
    return httpParams;
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { GlobalStorageService } from './global-storage.service';
import * as _ from 'lodash';

const PRIVILEGE_LIST = 'privilege_list';

@Injectable()
export class PrivilegesService {
  private privchange: Subject<any> = new Subject();
  privileges: object = {};
  privChanged$ = this.privchange.asObservable();

  constructor(private storage: GlobalStorageService) {
    let privs = this.storage.getLocal(PRIVILEGE_LIST);
    if(!_.isEmpty(privs)) {
      this.setPrivileges(privs);
    }
  }

  public setPrivileges(privs: string) {
    let privList = privs.split(',');
    this.privileges = {};
    _.each(privList, (priv) => {
      this.privileges[priv] = true;
    });

    this.privchange.next(this.privileges);
  }

}

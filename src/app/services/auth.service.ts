import { Injectable } from '@angular/core';
import { GlobalStorageService } from './global-storage.service';
import * as _ from 'lodash';

import { LOGIN_DATA, LOGIN_TOKEN, ORG_OID, PRIVILEGE_LIST, ROLES } from './apis/login.service';
import USER_ROLE from 'app/config/user.roles';
import { SEARCH_PRIVILEGES } from 'app/components/menu/constant';

@Injectable()
export class AuthService {
  public org = '';
  public token = '';

  constructor(private storage: GlobalStorageService) {}

  public getToken () {
    if (!this.token && this.storage.getLocal(LOGIN_TOKEN)) {
      return this.storage.getLocal(LOGIN_TOKEN);
    }

    return this.token;
  }

  public cleanup () {
    [LOGIN_DATA, LOGIN_TOKEN, ORG_OID, PRIVILEGE_LIST].map(key => this.storage.removeLocal(key));
  }

  public getPrivileges () {
    const privileges = this.storage.getLocal(PRIVILEGE_LIST);

    if (typeof privileges !== 'string') {
      return [];
    }

    return privileges.split(',');
  }

  public getRoles () {
    const roles = this.storage.getLocal(ROLES);

    return _.isArray(roles) ? roles : [roles];
  }

  public hasPrivilege (privilege, strict = false) {
    const asArray = _.isArray(privilege) ? privilege : [privilege];
    const privilegesList = this.getPrivileges();
    const userRoles = this.getRoles();

    if (strict) {
      return _.every(asArray, priv => {
        if (_.isFunction(priv)) {
          return priv(privilegesList, userRoles);
        }

        return _.includes(privilegesList, priv);
      });
    }

    const fns = _.filter(asArray, _.isFunction);
    const allPrimitives = _.filter(asArray, item => !_.isFunction(item));
    const hasAtLeastOnePriv = allPrimitives.length ? _.intersection(privilegesList, allPrimitives).length > 0 : true;
    const allFns = fns.length ? _.every(fns, privFn => privFn(privilegesList, userRoles)) : true;

    return hasAtLeastOnePriv && allFns;
  }

  public hasRole (role) {
    const roles = this.getRoles();
    const roleAsArray = _.isArray(role) ? role : [role];

    return _.intersection(roles, roleAsArray).length > 0;
  }

  public applyPrivileges (collection) {
    return _.reduce(collection, (acc, item) => {
      const {children = false, priv = false, role = false} = item;

      if (
        priv && role && this.hasPrivilege(priv) && this.hasRole(role) ||
        priv && !role && this.hasPrivilege(priv) ||
        !priv && role && this.hasRole(role)
      ) {
        if (children) {
          item.children = this.applyPrivileges(children);

          if (item.children.length !== 0) {
            acc.push(item);
          }
        } else {
          acc.push(item);
        }
      } else if (!priv && !role) {
        acc.push(item);
      }

      return acc;
    }, []);
  }

  public shouldShowSearch() {
    return this.hasPrivilege(SEARCH_PRIVILEGES);
  }
}

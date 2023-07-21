import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, APIResult } from './api.service';
import { AuthService } from 'app/services/auth.service';
import * as _ from 'lodash';
import { MENU_ITEMS } from 'app/components/menu/constant';
import { environment } from '../../../environments/environment';
import {compactInteger} from 'humanize-plus';

export interface MenuItem {
  id?           : string;
  text?         : string;
  count?        : number;
  key?          : string;
  name?         : string;
  priv?         : string;
  icon?         : string;
  isExpandable? : boolean;
  isExpanded?   : boolean;
  isActive?     : boolean;
  route?        : string;
  routeParam?   : string;
  fullRoute?    : string;
  redirect?     : string;
  children?     : Array<MenuItem>;
}

@Injectable()
export class MenuService {
  private root = '/ddm/main.html';
  private menuItems = {
    top    : this.authService.applyPrivileges(MENU_ITEMS.TOP([])),
    bottom : this.authService.applyPrivileges(MENU_ITEMS.BOTTOM)
  };

  public changeIframeHash$: EventEmitter<any>;
  public menuFetchSuccess$: EventEmitter<any>;
  public customRedirect$: EventEmitter<any>;

  constructor(private apiService: ApiService, private authService: AuthService) {
    this.changeIframeHash$ = new EventEmitter();
    this.menuFetchSuccess$ = new EventEmitter();
    this.customRedirect$ = new EventEmitter();
  }

  public changeIframeHash(params) {
    this.changeIframeHash$.emit(params);
  }

  public emitRedirect(params) {
    this.customRedirect$.emit(params);
  }

  isItemExpandable = item => {
    const {children} = item;

    return children && children.length > 1 || item.text === 'Custom Searches';
  }

  formatItem = (item: MenuItem) => {
    const newItem = {
      ...item,
      count        : typeof item.count !== 'undefined' ? compactInteger(item.count, 1) : '',
      isActive     : false,
      key          : `it-explorer-${item.id}`,
      redirect     : `#itexplorer/${item.id}`,
      route        : 'it-explorer',
      routeParam   : _.kebabCase(item.id),
      fullRoute    : `it-explorer/${_.kebabCase(item.id)}`,
      name         : item.text || item.name,
      isExpandable : this.isItemExpandable(item),
      isExpanded   : false
    };

    return newItem;
  };

  formatBottomItem = item => ({
    ...item,
    isActive     : false,
    key          : item.key || item.id,
    fullRoute    : item.route,
    name         : item.text || item.name,
    isExpandable : this.isItemExpandable(item),
    isExpanded   : false
  });

  format = items => _.map(items, (item: MenuItem) => {
    const formattedItem = this.formatItem(item);

    if (item.children && item.children.length) {
      const formattedChildren = this.format(item.children);

      formattedItem.count = formattedChildren[0].count;
      formattedItem.children = formattedChildren;
    }

    return formattedItem;
  });

  formatBottom = items => _.map(items, (item: MenuItem) => {
    const formattedItem = this.formatBottomItem(item);

    if (item.children && item.children.length) {
      const formattedChildren = this.formatBottom(item.children);

      formattedItem.count = formattedChildren[0].count;
      formattedItem.children = formattedChildren;
    }

    return formattedItem;
  });

  public fetchMenuItems() {
    const uri = 'itu/tree?node=root&id=root';

    return this.apiService.callApi('GET', uri)
      .do(result => {
        if (result.success) {
          const itExplorerItems = this.format(result.children);
          const topMenuItems = this.authService.applyPrivileges(MENU_ITEMS.TOP(itExplorerItems));
          const bottomMenuItems = this.authService.applyPrivileges(MENU_ITEMS.BOTTOM);

          this.menuItems.top = topMenuItems;
          this.menuItems.bottom = bottomMenuItems;

          this.menuFetchSuccess$.emit();
        }

        return result;
      })
      .share();
  }

  public getMenuItems(resetExpanded = false) {
    if (resetExpanded) {
      this.menuItems = {
        top : _.map(this.menuItems.top, item => ({
          ...item,
          isExpanded : false
        })),
        bottom : _.map(this.menuItems.bottom, item => ({
          ...item,
          isExpanded : false
        }))
      };
    }

    return {
      top : this.authService.applyPrivileges(this.menuItems.top),
      bottom : this.authService.applyPrivileges(this.menuItems.bottom)
    };
  }

  private flattenDeep = collection => _.reduce(collection, (acc, item: MenuItem) => [
    ...acc,
    ...item.children ? this.flattenDeep(item.children) : [item]
  ], []);

  public flatten = collection => _.reduce(collection, (acc, {children, ...rest}) => [
    ...acc,
    ...children ? [rest, ...this.flatten(children)] : [rest]
  ], []);

  private findItemFor = url => {
    const normalizedUrl = url.replace(/\/main\//, '');
    const {top, bottom} = this.menuItems;
    const allItems = [...top, ...bottom];
    const flattenItems = this.flatten(allItems);

    return _.find(flattenItems, ({fullRoute}) => fullRoute === normalizedUrl);
  };

  public getIframeUrl = ({redirect = '#_'}) => {
    if (!environment.production) {
      return `${environment.envPath}${this.root.substring(1)}${redirect}`;
    }

    const {location : {protocol, hostname}} = document;

    return `${protocol}//${hostname}${this.root}${redirect}`;
  }

  private normalize = url => {
    const [path] = url.split(';');
    const [withoutQuery] = path.split('?');

    return withoutQuery;
  }

  private getParams = url => {
    const [, ...rest] = url.split(';');

    const redirectUrl = rest.reduce((acc, item) => [
      ...acc,
      item.split('=')[1]
    ], ['#ituniverse']).join('/');

    return redirectUrl;
  }

  public getIframeParams = url => {
    const withoutQueryParams = this.normalize(url);
    let item: MenuItem = this.findItemFor(withoutQueryParams);

    if (withoutQueryParams.indexOf('/open') > -1) {
      item = {
        redirect : this.getParams(url)
      };
    }

    return {
      iframeUrl      : this.getIframeUrl(item || {}),
      showOldVersion : Boolean(item && item.redirect) || withoutQueryParams.indexOf('/open') > -1
    };
  }

  public getLabel = url => {
    const withoutQueryParams = this.normalize(url);
    const item: MenuItem = this.findItemFor(withoutQueryParams);

    return item && item.text || '';
  };

  public getItUniverseSearchUrl = () => this.getIframeUrl({redirect : '#ituniverse'});

  public shouldShowSearch = () => this.authService.shouldShowSearch();
}

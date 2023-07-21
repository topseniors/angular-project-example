import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { MenuService, MenuItem } from '../../services/apis/menu.service';
import { Subscription, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';
import { SearchService, StringableCollection } from '../../services/apis/search.service';
import { MENU_ITEMS } from './constant';

interface MenuItems { top: Array<Object>, bottom: Array<Object> }

let topMenuItems;
let bottomMenuItems;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent implements OnInit, OnDestroy {
  @Output() onToggle: EventEmitter<any> = new EventEmitter();
  @Output() onManageOpen: EventEmitter<any> = new EventEmitter();
  @Input() opened: boolean;
  @Input() pinned: boolean;
  @ViewChild('searchAutoComplete') searchAutoComplete;

  searchString = '';
  timeoutHandler = null;
  showSearch = false;

  searchInputCtrl: FormControl;
  searchKeywords$: Observable<string[]> = Observable.of([]);

  private sub: Subscription;
  private static readonly pollingInterval = 30000;
  private lastItExplorerItem: any = null;
  private menuItems: MenuItems;
  private pollingSub;
  private expanded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private navigationService: NavigationService,
    private searchService: SearchService
  ) {
    this.searchInputCtrl = new FormControl();
    this.sub = this.searchInputCtrl.valueChanges.subscribe((keyword: string) => {
      this.cancelTimeout();

      if (!keyword) {
        return this.searchKeywords$ = Observable.of([]).share();
      }

      this.timeoutHandler = setTimeout(() => {
        this.searchKeywords$ = this.getSearchKeywords(keyword);
        this.timeoutHandler = null;
      }, 200);
    });

    this.showSearch = this.menuService.shouldShowSearch();
  }

  ngOnInit() {
    this.menuItems = this.menuService.getMenuItems(true);

    this.highlightActive(undefined);
    this.poll();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.highlightActive(event.url);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }

    topMenuItems = null;
    bottomMenuItems = null;
  }

  private poll() {
    let source = this.menuService.fetchMenuItems()
      .take(1)
      .merge(Observable
        .interval(MenuComponent.pollingInterval)
        .flatMap(() => this.menuService.fetchMenuItems())
      );

    this.pollingSub = source.subscribe(({ children, success }) => {
      if (success) {
        const newMenuItems = this.menuService.getMenuItems();

        topMenuItems = topMenuItems || _.cloneDeep(newMenuItems.top);
        bottomMenuItems = bottomMenuItems || _.cloneDeep(newMenuItems.bottom);

        this.menuItems.top = this.keepExpandedRecursive(newMenuItems.top, topMenuItems);
        this.menuItems.bottom = this.keepExpandedRecursive(newMenuItems.bottom, bottomMenuItems);

        this.highlightActive(undefined);
      }
    });
  }

  private keepExpandedRecursive = (items, oldItems) => _.map(items, (item: MenuItem, index) => {
    if (item.children && item.children.length) {
      item.children = this.keepExpandedRecursive(item.children, (oldItems && oldItems[index].children) || []);
    }

    item.isExpanded = item.isExpanded || (oldItems && oldItems[index].isExpanded) || false;

    return item;
  })

  private recursiveHighlight = (collection, activeUrl) => _.map(collection, (item: MenuItem) => {
    if (item.children && item.children.length) {
      item.children = this.recursiveHighlight(item.children, activeUrl);

      const hasActiveChild = _.some(item.children, ({ isActive }) => isActive);
      const isMenuItemActive = item.fullRoute === activeUrl;

      item.isActive = hasActiveChild || isMenuItemActive;

      if (item.key === 'it-explorer-application' && activeUrl.indexOf('/open') > -1) {
        item.isActive = true;
      }
    } else {
      item.isActive = item.fullRoute === activeUrl;

      if (item.route.indexOf('discovery/scan-jobs') === 0 && activeUrl.indexOf('discovery/scan-jobs') === 0) {
        item.isActive = true;
      }

      if (item.key === 'it-explorer-application' && activeUrl.indexOf('/open') > -1) {
        item.isActive = true;
      }
    }

    return item;
  });

  private highlightActive(url) {
    const activeUrl = this.getCurrentPath(url);
    const { top, bottom } = this.menuItems;

    this.menuItems.top = this.recursiveHighlight(top, activeUrl);
    this.menuItems.bottom = this.recursiveHighlight(bottom, activeUrl);
  }

  private trackByFn(index, item) {
    return item.key;
  }


  private accordionEffect = (collection, clickedItem) => _.map(collection, (item: MenuItem) => {
    if (item.children && item.children.length) {
      const flattenedChildren = this.menuService.flatten(item.children);

      const includesClickedItem = _.some(flattenedChildren, ({ key }) => key === clickedItem.key);

      if (item.key === clickedItem.key) {
        item.isExpanded = !item.isExpanded;
      } else if (item.isExpanded) {
        item.isExpanded = includesClickedItem;
      }

      item.children = this.accordionEffect(item.children, clickedItem);
    } else if (item.key !== clickedItem.key) {
      item.isExpanded = false;
    }

    return item;
  });

  private expandCollapse(item, $event = null) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    const { top, bottom } = this.menuItems;

    this.menuItems.top = this.accordionEffect(top, item);
    this.menuItems.bottom = this.accordionEffect(bottom, item);

    topMenuItems = _.cloneDeep(this.menuItems.top);
    bottomMenuItems = _.cloneDeep(this.menuItems.bottom);
  }

  private itemClick(item: MenuItem, $event, level = 1) {
    $event.preventDefault();
    $event.stopPropagation();

    const navigateTo = [`main/${item.route}`];

    if (level === 1) {
      if (item.key === 'itExplorer') {
        if (this.lastItExplorerItem) {
          navigateTo.push(this.lastItExplorerItem.routeParam);
        } else {
          navigateTo.push('iqcloud-search-searchallapps');
        }

      } else if (item.key === 'help') {
        navigateTo.push('introduction');
      } else {
        if (item.routeParam) {
          navigateTo.push(item.routeParam);
        }
      }
    } else {
      if (item.children && item.children.length > 0) {
        navigateTo.push(item.children[0].routeParam);
      } else {
        if (item.routeParam) {
          navigateTo.push(item.routeParam);
        }
      }
    }

    if (navigateTo[0].indexOf('it-explorer') > -1) {
      this.lastItExplorerItem = item;
    }

    this.router.navigate(navigateTo);

    if (item.id === 'help-contents') {
      window.open('http://wiki.iquate.com/login.action?os_destination=/display/ALLDOC/Documentation&os_username=guest&os_password=guest', 'ITSCAPEHelp');
    }

    if (level === 1) {
      this.expandCollapse(item);
    }
  }

  private getSearchKeywords(keyword: string): Observable<string[]> {
    const params: StringableCollection = {
      from: 0,
      pageSize: 9999,
      q: keyword
    };

    return this.searchService.getSearchKeywords(params).catch(() => Observable.of([]).share());
  }

  cancelTimeout() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);

      this.timeoutHandler = null;
    }
  }

  startSearch() {
    this.cancelTimeout();
    this.searchKeywords$ = Observable.of([]).share();
    this.router.navigate(['/main/search/do-search', { searchString: this.searchString }]);
  }

  clearSearch() {
    this.cancelTimeout();
    this.searchKeywords$ = Observable.of([]).share();
    this.searchString = '';
    this.router.navigate(['/main/search/do-search', { searchString: this.searchString }]);
  }

  private toggleIsOpened() {
    this.onToggle.emit();
  }

  private getCurrentPath(url = this.router.url) {
    const withoutMain = url.replace(/\/main\//, '');
    const [path] = withoutMain.split(';');
    const [withoutQuery] = path.split('?');

    return withoutQuery;
  }
}

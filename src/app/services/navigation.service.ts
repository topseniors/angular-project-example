import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { PrivilegesService } from './privileges.service';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';

@Injectable()
export class NavigationService {
  private privNav: any[];
  private subscription: any;
  private root = '/ddm/main.html';
  private nav = [
    {
      name: 'SEARCH.NAME',
      priv: 'PRIV_SEARCH_READ',
      icon: 'fa-search',
      route: 'search',
      redirect: '#search'
    },
    {
      name: 'IT_DCVIEW.NAME',
      priv: 'PRIV_ITMODEL_READ',
      icon: 'fa-code-fork',
      route: 'chromedcview',
      redirect: '#chromedcview'
    },
    {
      name:'DASHBOARD.NAME',
      priv:'PRIV_DASHBOARD_READ',
      icon:'fa-th',
      route:'dashboard',
      redirect: '#dashboard'
      // menu: [
      //   {
      //     name:'DASHBOARD.OVERVIEW_TITLE',
      //     route:'dashboard/overview'
      //   },
      //   {
      //     name:'DASHBOARD.INVENTORY_TITLE',
      //     route:'dashboard/inventory'
      //   },
      //   {
      //     name:'DASHBOARD.APP_CHANGES_TITLE',
      //     route:'dashboard/appChanges'
      //   },
      //   {
      //     name:'DASHBOARD.SERVER_CHANGES_TITLE',
      //     route:'dashboard/serverChanges'
      //   },
      //   {
      //     name:'DASHBOARD.DISCOVERY_TITLE',
      //     route:'dashboard/discovery'
      //   },
      //   {
      //     name:'DASHBOARD.USERS_TITLE',
      //     route:'dashboard/users'
      //   }
      // ]
    }, {
      name:'IT_EXPLORER.NAME',
      priv:'PRIV_ITMODEL_READ',
      icon:'fa-share-alt',
      route:'it-explorer',
      redirect: '#ituniverse',
      /*menu: [
       {
       name:'All',
       route:'it-explorer/All/list'
       },{
       name:'App Components',
       route:'it-explorer/ProductInstance/list'
       },{
       name:'Servers',
       route:'it-explorer/ComputerSystem/list'
       },{
       name:'Network Devices',
       route:'it-explorer/NetworkDevice/list'
       },{
       name:'Storage Devices',
       route:'it-explorer/StorageDevice/list'
       },{
       name:'Software Clusters',
       route:'it-explorer/SWCluster/list'
       },{
       name:'Applications',
       route:'it-explorer/Application/list'
       },{
       name:'Services',
       route:'it-explorer/Service/list'
       }
       ]*/
    },{
      name:'DISCOVERY.NAME',
      icon:'fa-search-plus',
      route:'discovery',
      redirect: '#discovery',
      // Scan Jobs Scopes Keychains Application  Reports
      menu: [
        {
          name:'DISCOVERY.SCAN_JOBS.NAME',
          route:'discovery/scan-jobs',
          redirect:'#discovery/scanjobs'
        },
        {
          name:'DISCOVERY.SCOPES',
          route:'discovery/scopes1',
          redirect:'#discovery/scopes'
        },
        {
          name:'DISCOVERY.KEYCHAINS',
          route:'discovery/keychains1',
          redirect:'#discovery/keychains'
        },
        {
          name:'Application Review',
          route:'discovery/appreview1',
          redirect:'#discovery/appreview'
        },
        {
          name:'REPORTS.NAME',
          route:'discovery/reports1',
          redirect:'#discovery/reports'
        }
      ]
    },{
      name:'REPORTS.NAME',
      priv: 'PRIV_REPORT_READ',
      icon:'fa-tachometer',
      route:'reports',
      redirect: '#reports'
    },{
      name:'CATALOG.NAME',
      priv: 'PRIV_CATALOG_READ',
      icon:'fa-file-text',
      menu: [
        {
          name:'Manufacturers',
          route:'catalog/manufacturers',
          redirect:'#catalog/manufacturers'
        },
        {
          name:'Application Components',
          route:'catalog/products',
          redirect:'#catalog/products'
        },
        {
          name:'OS Families',
          route:'catalog/osfamilies',
          redirect:'#catalog/osfamilies'
        },
        {
          name:'Operating Systems',
          route:'catalog/operatingsystems',
          redirect:'#catalog/operatingsystems'
        },
        {
          name:'Systems',
          route:'catalog/systems',
          redirect:'#catalog/systems'
        },
        {
          name:'Cloud Services',
          route:'catalog/cloud-services',
          redirect:'#catalog/cloud-services'
        },
        {
          name:'Templates',
          route:'catalog/templates',
          redirect:'#catalog/templates'
        }
      ]
    },{
      name:'Discovery-NG',
      icon:'fa-search-plus',
      route:'discoveryng',
      menu: [
        {
          name:'DASHBOARD.NAME',
          route:'discovery/dashboard'
        },{
          name:'DISCOVERY.SCAN_JOBS.NAME',
          priv: 'PRIV_SCANCONF_WRITE',
          route:'discovery/scan-jobs'
        },{
          name:'DISCOVERY.SCOPES',
          route:'discovery/scopes'
        },{
          name:'DISCOVERY.KEYCHAINS',
          priv: 'PRIV_KEYCHAIN_READ',
          route:'discovery/keychains'
        },{
          name:'DISCOVERY.REPORTS.NAME',
          route:'discovery/reports'
        }
      ]
    },{
      name:'IT Explorer NG',
      priv:'PRIV_ITMODEL_READ',
      icon:'fa-share-alt',
      route:'itExplorer',
      menu: [
        {
          name:'IT_EXPLORER.APPLICATIONS_TITLE',
          route:'itExplorer/applications/list'
        },{
          name:'IT_EXPLORER.SERVICES_TITLE',
          route:'itExplorer/service/list'
        },{
          name:'IT_EXPLORER.SERVERS_TITLE',
          route:'itExplorer/servers'
        },{
          name:'IT_EXPLORER.APP_COMPONENTS_TITLE',
          route:'itExplorer/applicationComponents'
        },{
          name:'IT_EXPLORER.PLATFORM_APP_TITLE',
          route:'itExplorer/platformApplication'
        },{
          name:'IT_EXPLORER.SW_CLUSTER_TITLE',
          route:'itExplorer/swCluster'
        },{
          name:'IT_EXPLORER.VI_CLUSTER_TITLE',
          route:'itExplorer/viCluster'
        },{
          name:'IT_EXPLORER.OS_CLUSTER_TITLE',
          route:'itExplorer/osCluster'
        },{
          name:'IT_EXPLORER.NETWORK_DEVICE_TITLE',
          route:'itExplorer/networkDevice'
        },{
          name:'IT_EXPLORER.STORAGE_DEVICE_TITLE',
          route:'itExplorer/storageDevice'
        }
      ]
    },{
      name:'SETTINGS.NAME',
      icon:'fa-cog',
      route:'settings',
      align:'bottom',
      redirect: '#administration'
    },{
      name:'HELP.NAME',
      icon:'fa-info-circle',
      route:'help',
      align:'bottom'
    }
  ]

  constructor(private privilegesService:PrivilegesService,
              @Inject(DOCUMENT) private document: any) {
    this.setPrivileges(privilegesService.privileges);
    this.subscription = privilegesService.privChanged$.subscribe(privs => {
      this.setPrivileges(privs);
    });
  }

  setPrivileges(privs) {
    this.privNav = _.filter(this.nav, (item: any) => {
      return _.isUndefined(item.priv) || privs[item.priv] === true;
    });
  }

  public getNav():any[] {
    return this.flattenTree(this.privNav);
  }

  flattenTree(tree:any[], level:number = 0) {
    var result = [];
    _.each(tree, (node) => {
      result.push(_.assign({ level: level, collapsed: level > 0, expanded: false}, node));
      node.menu && (result = _.union(result, this.flattenTree(node.menu, level + 1)))
    });
    return result;
  }

  public getSubNav(key):any[] {
    var item:any = _.find(this.privNav, (item) => {
      return item.route.indexOf(key) !== -1;
    })
    return item.menu;
  }

  public getNavItem(key) {
    var found:any;
    _.each(this.privNav, (item:any) => {
      if(item.route.indexOf(key) !== -1) {
        found = item;
      }

      if(item.menu) {
        _.each(item.menu, (item:any) => {
          if(item.route.indexOf(key) !== -1) {
            found = item;
          }
        })
      }
    })

    return found;
  }

  public getRedirect(key) {
    if (!key) {
      return '';
    }

    let found = this.getNav().find(item => {
      const part = key.split('/main/')[1];

      return item.route === part || (part && part.indexOf(item.route) > -1);
    });

    if (found && found.redirect) {
      if (!environment.production) {
        return environment.envPath + this.root + found.redirect;
      }

      return document.location.protocol +'//'+ document.location.hostname + this.root + found.redirect;
    } else {
      return '';
    }
  }
}

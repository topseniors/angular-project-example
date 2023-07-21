import * as _ from 'lodash';
import PRIVILEGES from 'app/config/privileges';
import USER_ROLE from 'app/config/user.roles';

const {
  PRIV_SEARCH_CREATE,
  PRIV_SEARCH_DELETE,
  PRIV_SEARCH_READ,
  PRIV_SEARCH_WRITE,

  PRIV_DASHBOARD_CREATE,
  PRIV_DASHBOARD_DELETE,
  PRIV_DASHBOARD_READ,
  PRIV_DASHBOARD_WRITE,

  PRIV_ITMODEL_CREATE,
  PRIV_ITMODEL_DELETE,
  PRIV_ITMODEL_EXPORT,
  PRIV_ITMODEL_READ,
  PRIV_ITMODEL_WRITE,

  PRIV_SCANCONF_CREATE,
  PRIV_SCANCONF_DELETE,
  PRIV_SCANCONF_READ,
  PRIV_SCANCONF_WRITE,

  PRIV_REPORT_CREATE,
  PRIV_REPORT_DELETE,
  PRIV_REPORT_EXECUTE,
  PRIV_REPORT_READ,
  PRIV_REPORT_WRITE,

  PRIV_CATALOG_CREATE,
  PRIV_CATALOG_DELETE,
  PRIV_CATALOG_READ,
  PRIV_CATALOG_WRITE,

  PRIV_ORG_CREATE,
  PRIV_ORG_DELETE,
  PRIV_ORG_LIMITED_ACCESS,
  PRIV_ORG_READ,
  PRIV_ORG_WRITE,

  SUPPORTDATA_READ
} = PRIVILEGES;

export const SEARCH_PRIVILEGES = [PRIV_SEARCH_CREATE, PRIV_SEARCH_DELETE, PRIV_SEARCH_READ, PRIV_SEARCH_WRITE];
const DASHBOARD_PRIVILEGES = [PRIV_DASHBOARD_CREATE, PRIV_DASHBOARD_DELETE, PRIV_DASHBOARD_READ, PRIV_DASHBOARD_WRITE];
const IT_EXPLORER_PRIVILEGES = [PRIV_ITMODEL_CREATE, PRIV_ITMODEL_DELETE, PRIV_ITMODEL_EXPORT, PRIV_ITMODEL_READ, PRIV_ITMODEL_WRITE];
const SCAN_CONFIGURATION_PRIVILEGES = [PRIV_SCANCONF_CREATE, PRIV_SCANCONF_DELETE, PRIV_SCANCONF_READ, PRIV_SCANCONF_WRITE];
const SCAN_MONITORING_PRIVILEGES = [PRIV_SCANCONF_CREATE, PRIV_SCANCONF_DELETE, PRIV_SCANCONF_READ, PRIV_SCANCONF_WRITE];
const REPORTS_PRIVILEGES = [PRIV_REPORT_CREATE, PRIV_REPORT_DELETE, PRIV_REPORT_EXECUTE, PRIV_REPORT_READ, PRIV_REPORT_WRITE];
const CATALOG_PRIVILEGES = [PRIV_CATALOG_CREATE, PRIV_CATALOG_DELETE, PRIV_CATALOG_READ, PRIV_CATALOG_WRITE];
const ORGANIZATIONS_PRIVILEGES = [PRIV_ORG_CREATE, PRIV_ORG_DELETE, PRIV_ORG_LIMITED_ACCESS, PRIV_ORG_READ, PRIV_ORG_WRITE];

export const MENU_ITEMS = {
  TOP: itExplorerChildren => [{
    key: 'dashboard',
    name: 'NAVIGATION_MENU.DASHBOARD',
    priv: DASHBOARD_PRIVILEGES,
    role: [USER_ROLE.CUSTOMER],
    icon: 'icon-dashboard',
    route: 'dashboard',
    fullRoute: 'dashboard',
    redirect: '#dashboard'
  }, {
    key: 'itExplorer',
    name: 'NAVIGATION_MENU.IT_EXPLORER',
    priv: IT_EXPLORER_PRIVILEGES,
    role: [USER_ROLE.CUSTOMER],
    icon: 'icon-it-explorer',
    isExpandable: true,
    isExpanded: false,
    route: 'it-explorer',
    routeParam: 'application',
    fullRoute: 'it-explorer/application',
    redirect: '#itexplorer/application',

    /**
     * These items are retrieved via an API call.
     * For more details @see menu.service.ts::getMenuItems
     */
    children: itExplorerChildren
  }, {
    key: 'discovery',
    name: 'NAVIGATION_MENU.DISCOVERY.PARENT',
    icon: 'icon-discovery',
    priv: false,
    role: [USER_ROLE.CUSTOMER],
    isExpandable: true,
    isExpanded: false,
    route: 'discovery/scan-jobs',
    redirect: '#discovery/scanjobs',
    children: [{
      name: 'NAVIGATION_MENU.DISCOVERY.SCAN_CONFIGURATION',
      priv: SCAN_CONFIGURATION_PRIVILEGES,
      role: false,
      route: 'discovery/sencha',
      fullRoute: 'discovery/sencha',
      redirect: '#discovery/scanjobs'
    }, {
      name: 'NAVIGATION_MENU.DISCOVERY.SCAN_MONITORING',
      priv: SCAN_MONITORING_PRIVILEGES,
      role: false,
      route: 'discovery/scan-jobs',
      fullRoute: 'discovery/scan-jobs'
    }]
  }, {
    key: 'reports',
    name: 'NAVIGATION_MENU.REPORTS',
    priv: REPORTS_PRIVILEGES,
    role: [USER_ROLE.CUSTOMER],
    icon: 'icon-reports',
    route: 'reports',
    fullRoute: 'reports',
    redirect: '#reports'
  }, {
    key: 'catalog',
    name: 'NAVIGATION_MENU.CATALOG.PARENT',
    priv: CATALOG_PRIVILEGES,
    role: [USER_ROLE.CUSTOMER, USER_ROLE.SYSTEM_PROVIDER],
    icon: 'icon-catalog',
    route: 'catalog',
    fullRoute: 'catalog',
    redirect: '#catalog'
  }, {
    key: 'dbVisualizer',
    name: 'NAVIGATION_MENU.DB_VISUALIZER',
    priv: [(privilegesList, userRoles) => {
      if (userRoles[0] === USER_ROLE.CUSTOMER) {
        return _.includes(privilegesList, SUPPORTDATA_READ);
      }

      return true;
    }],
    role: [USER_ROLE.CUSTOMER, USER_ROLE.SYSTEM_PROVIDER],
    icon: 'icon-db-vizualizer-two',
    route: 'db-visualizer',
    fullRoute: 'db-visualizer',
    redirect: '#modelbrowser'
  }, {
    key: 'jobs',
    name: 'NAVIGATION_MENU.JOBS',
    priv: false,
    role: [USER_ROLE.SYSTEM_PROVIDER],
    icon: 'icon-db-vizualizer-two',
    route: 'jobs',
    fullRoute: 'jobs',
    redirect: '#jobs'
  }, {
    key: 'monitoring',
    name: 'NAVIGATION_MENU.MONITORING.PARENT',
    priv: false,
    role: [USER_ROLE.SYSTEM_PROVIDER],
    icon: 'icon-db-vizualizer',
    route: 'monitoring/appliances',
    fullRoute: 'monitoring/appliances',
    redirect: '#monitoring/appliances',
    isExpandable: true,
    isExpanded: false,
    children: [{
      id: 'monitoring-appliances',
      name: 'NAVIGATION_MENU.MONITORING.APPLIANCES',
      priv: false,
      role: false,
      route: 'monitoring/appliances',
      fullRoute: 'monitoring/appliances',
      redirect: '#monitoring/appliances'
    }, {
      id: 'monitoring-scan-jobs',
      name: 'NAVIGATION_MENU.MONITORING.SCAN_JOBS',
      priv: false,
      role: false,
      route: 'monitoring/scan-jobs',
      fullRoute: 'monitoring/scan-jobs',
      redirect: '#monitoring/scanjobs'
    }, {
      id: 'monitoring-active-sessions',
      name: 'NAVIGATION_MENU.MONITORING.ACTIVE_SESSIONS',
      priv: false,
      role: false,
      route: 'monitoring/active-sessions',
      fullRoute: 'monitoring/active-sessions',
      redirect: '#monitoring/activesessions'
    }, {
      id: 'monitoring-scan-issues',
      name: 'NAVIGATION_MENU.MONITORING.SCAN_ISSUES',
      priv: false,
      role: false,
      route: 'monitoring/scan-issues',
      fullRoute: 'monitoring/scan-issues',
      redirect: '#monitoring/scanissues'
    }]
  }, {
    key: 'organizations',
    name: 'NAVIGATION_MENU.ORGANIZATIONS',
    priv: ORGANIZATIONS_PRIVILEGES,
    role: [USER_ROLE.SYSTEM_PROVIDER, USER_ROLE.SERVICE_PROVIDER],
    icon: 'icon-organization',
    route: 'organizations',
    fullRoute: 'organizations',
    redirect: '#organizations'
  }],
  BOTTOM: [{
    key: 'audit',
    name: 'NAVIGATION_MENU.AUDIT.NAME',
    priv: false,
    role: false,
    icon: 'icon-audit',
    route: 'audit/dashboard',
    isExpandable: true,
    isExpanded: false,
    children: [{
      id: 'dashboard',
      name: 'Dashboard',
      priv: false,
      role: false,
      route: 'audit/dashboard',
      fullRoute: 'audit/dashboard'
    }, {
      id: 'events',
      name: 'Events',
      priv: false,
      role: false,
      route: 'audit/events',
      fullRoute: 'audit/events'
    }, {
      id: 'counts',
      name: 'Counts',
      priv: false,
      role: false,
      route: 'audit/counts',
      fullRoute: 'audit/counts'
    }]
  }, {
    key: 'integrations',
    name: 'NAVIGATION_MENU.INTEGRATIONS',
    priv: [PRIV_ITMODEL_READ],
    role: [USER_ROLE.CUSTOMER, USER_ROLE.SERVICE_PROVIDER],
    icon: 'icon-integrations',
    route: 'integrations',
    fullRoute: 'integrations'
  }, {
    key: 'settings',
    name: 'NAVIGATION_MENU.SETTINGS',
    priv: false,
    role: [USER_ROLE.CUSTOMER, USER_ROLE.SERVICE_PROVIDER],
    icon: 'icon-settings',
    route: 'settings',
    fullRoute: 'settings',
    redirect: '#administration'
  }, {
    key: 'help',
    name: 'NAVIGATION_MENU.HELP',
    priv: false,
    role: [USER_ROLE.CUSTOMER],
    icon: 'icon-help',
    route: 'help',
    fullRoute: 'help/welcome',
    redirect: '#help/welcome',
    isExpandable: true,
    isExpanded: false,
    children: [{
      id: 'help-introduction',
      name: 'Introduction Guide',
      priv: false,
      role: false,
      route: 'help/introduction',
      fullRoute: 'help/introduction',
      redirect: '#help/welcome'
    }, {
      id: 'help-appliance',
      name: 'Appliance Deployment Wizard',
      priv: false,
      role: false,
      route: 'help/appliance',
      fullRoute: 'help/appliance',
      redirect: '#help/appliance'
    }, {
      id: 'help-scanjob',
      name: 'ScanJob Configuration Wizard',
      priv: false,
      role: false,
      route: 'help/scanjob',
      fullRoute: 'help/scanjob',
      redirect: '#help/scanjob'
    }, {
      id: 'help-download',
      name: 'Download Virtual Appliance',
      priv: false,
      role: false,
      route: 'help/download',
      fullRoute: 'help/download',
      redirect: '#help/download'
    }, {
      id: 'help-contents',
      name: 'Contents',
      priv: false,
      role: false,
      route: 'help/contents',
      fullRoute: 'help/contents',
      redirect: '#help/contents'
    }, {
      id: 'help-about',
      name: 'About iQuate',
      priv: false,
      role: false,
      route: 'help/about',
      fullRoute: 'help/about',
      redirect: '#help/about'
    }]
  }, {
    key: 'errorLog',
    name: 'NAVIGATION_MENU.ERROR_LOG',
    priv: false,
    role: false,
    icon: 'icon-error-log',
    route: 'error-log',
    fullRoute: 'error-log'
  }]
};

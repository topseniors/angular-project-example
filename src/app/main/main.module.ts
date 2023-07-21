import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {
  MatCardModule,
  MatGridListModule,
  MatMenuModule,
  MatButtonModule,
  MatIconModule,
  MatIconRegistry,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatInputModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule,
  MatAutocompleteModule
} from '@angular/material';

import { SidebarModule } from '../components/sidebar';
import { ComponentsModule } from '../components/components.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { DndModule } from 'ng2-dnd';
import { ScanJobsModule } from './discovery/scan-jobs/scan-jobs.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ItExplorerModule } from './it-explorer/it-explorer.module';

import { GenericOutletComponent } from '../components/generic-outlet/generic-outlet.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { MainComponent } from './main.component';
import { DiscoveryComponent } from './discovery/discovery.component';
import { ErrorLogComponent } from './error-log/error-log.component';
import { ReportsComponent } from './reports/reports.component';
import { CatalogComponent } from './catalog/catalog.component';
import { SenchaDiscoveryComponent } from './discovery/sencha-discovery/sencha-discovery.component';
import { DbVisualizerComponent } from './db-visualizer/db-visualizer.component';
import { ScopesComponent } from './discovery/scopes/scopes.component';
import { KeychainsComponent } from './discovery/keychains/keychains.component';

import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { ServerSummaryComponent } from './dashboard/cards/server-summary.component';
import { AppSummaryComponent } from './dashboard/cards/app-summary.component';
import { DashboardCardComponent } from './dashboard/dashboard-card/dashboard-card.component';
import { CloudSummaryComponent } from './dashboard/cards/cloud-summary.component';
import { AppOverviewComponent } from './dashboard/cards/app-overview.component';

import { DiscoveryDashboardComponent } from './discovery/discovery-dashboard/discovery-dashboard.component';
import { DiscoveryReportsComponent } from './discovery/reports/reports.component';
import { DiscoveryReportsDashboardComponent } from './discovery/reports/dashboard/dashboard.component';
import { DiscoveryReportsScanneddevicesComponent } from './discovery/reports/scanneddevices/scanneddevices.component';
import { DiscoveryReportsMissingdevicesComponent } from './discovery/reports/missingdevices/missingdevices.component';

export function getScanJobsModule() { return ScanJobsModule; }
export function getSearchModule() { return SearchModule; }
export function getAuditModule() { return AuditModule; }
export function getIntegrationsModule() { return IntegrationsModule; }
export function getItExplorerModule() { return ItExplorerModule; }

export const appRoutes: Routes = [
  {
    path: 'main', component: MainComponent, data: { ignore: true }, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard', component: GenericOutletComponent, data: { title: 'DASHBOARD.NAME' }, children: [
          { path: 'overview', component: DashboardOverviewComponent, data: { title: 'DASHBOARD.OVERVIEW_TITLE' } }
        ]
      },
      { path: 'search', loadChildren: getSearchModule, data: { title: 'SEARCH.NAME' } },
      { path: 'audit', loadChildren: getAuditModule, data: { title: 'NAVIGATION_MENU.AUDIT.NAME' } },
      { path: 'error-log', component: ErrorLogComponent, data: { title: 'NAVIGATION_MENU.ERROR_LOG' } },
      { path: 'it-explorer', loadChildren: getItExplorerModule, data: { title: 'IT_EXPLORER.NAME' } },
      {
        path: 'discovery', component: DiscoveryComponent, data: { title: 'DISCOVERY.NAME' }, children: [
          { path: '', redirectTo: 'scanJobs', pathMatch: 'full' },
          { path: 'sencha', component: SenchaDiscoveryComponent, data: { title: 'NAVIGATION_MENU.DISCOVERY.SCAN_CONFIGURATION' } },
          { path: 'scan-jobs', loadChildren: getScanJobsModule, data: { title: 'NAVIGATION_MENU.DISCOVERY.SCAN_MONITORING' } },
          { path: 'dashboard', component: DiscoveryDashboardComponent, data: { title: 'DISCOVERY.DASHBOARD.NAME' } },
          { path: 'scopes', component: ScopesComponent, data: { title: 'DISCOVERY.SCOPES' } },
          { path: 'keychains', component: KeychainsComponent, data: { title: 'DISCOVERY.KEYCHAINS' } },
          {
            path: 'reports', component: ReportsComponent, data: { title: 'DISCOVERY.REPORTS.NAME' }, children: [
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              { path: 'dashboard', component: DiscoveryReportsDashboardComponent, data: { title: 'DISCOVERY.REPORTS.DASHBOARD.NAME' } },
              { path: 'scanneddevices', component: DiscoveryReportsScanneddevicesComponent, data: { title: 'DISCOVERY.REPORTS.SCANNEDDEVICES.NAME' } },
              { path: 'missingdevices', component: DiscoveryReportsMissingdevicesComponent, data: { title: 'DISCOVERY.REPORTS.MISSINGDEVICES.NAME' } }
            ]
          }
        ]
      },
      {
        path: 'help', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.HELP' }, children: [
          { path: ':id', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.HELP' } }
        ]
      },
      { path: 'reports', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.REPORTS' } },
      { path: 'integrations', loadChildren: getIntegrationsModule, data: { title: 'NAVIGATION_MENU.INTEGRATIONS' } },
      { path: 'catalog', component: CatalogComponent, data: { title: 'NAVIGATION_MENU.CATALOG.PARENT' } },
      { path: 'db-visualizer', component: DbVisualizerComponent, data: { title: 'NAVIGATION_MENU.DB_VISUALIZER' } },
      { path: 'jobs', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.JOBS' } },
      { path: 'organizations', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.ORGANIZATIONS' } },
      { path: 'monitoring', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.MONITORING.PARENT' }, children: [
        { path : 'appliances', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.MONITORING.APPLIANCES' } },
        { path : 'scan-jobs', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.MONITORING.SCAN_JOBS' } },
        { path : 'active-sessions', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.MONITORING.ACTIVE_SESSIONS' } },
        { path : 'scan-issues', component: ReportsComponent, data: { title: 'NAVIGATION_MENU.MONITORING.SCAN_ISSUES' } }
      ] },
      { path: 'settings', component: SettingsComponent, data: { title: 'NAVIGATION_MENU.SETTINGS' } }
    ]
  }
];

@NgModule({
  declarations: [
    MainComponent,
    DashboardComponent,
    SettingsComponent,
    DiscoveryComponent,
    ErrorLogComponent,
    ReportsComponent,
    CatalogComponent,
    SenchaDiscoveryComponent,
    DbVisualizerComponent,
    ScopesComponent,
    KeychainsComponent,
    DashboardOverviewComponent,
    ServerSummaryComponent,
    AppSummaryComponent,
    DashboardCardComponent,
    CloudSummaryComponent,
    AppOverviewComponent,
    DiscoveryDashboardComponent,
    DiscoveryReportsComponent,
    DiscoveryReportsDashboardComponent,
    DiscoveryReportsScanneddevicesComponent,
    DiscoveryReportsMissingdevicesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    MatCardModule,
    MatGridListModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    Ng2SmartTableModule,
    TranslateModule,
    DndModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    SidebarModule.forRoot()
  ],
  providers: [ MatIconRegistry ],
  entryComponents: [
    ServerSummaryComponent,
    AppSummaryComponent,
    CloudSummaryComponent,
    AppOverviewComponent
  ],
  exports: []
})
export class MainModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}

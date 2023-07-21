import { BrowserModule, HAMMER_GESTURE_CONFIG  } from '@angular/platform-browser';
import { GestureConfig, MatButtonModule, MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { RouterModule } from '@angular/router';
import { LoginModule } from './login/login.module';
import { MainModule } from './main/main.module';
import { ComponentsModule } from './components/components.module';

import { GlobalStorageService } from './services/global-storage.service';
import { ErrorService } from './services/error.service';
import { NavigationService } from './services/navigation.service';
import { AuthService } from './services/auth.service';
import { ToastrService } from './services/toastr.service';
import { AuditService } from './services/audit.service';
import { UtilsService } from './services/utils.service';
import { ApiService } from './services/apis/api.service';
import { AppliancesService } from './services/apis/appliances.service';
import { LocationsService } from './services/apis/locations.service';
import { LoginService } from './services/apis/login.service';
import { SummaryService } from './services/apis/summary.service';
import { ITUService } from './services/apis/itu.service';
import { MenuService } from './services/apis/menu.service';
import { ReportsService } from './services/apis/reports.service';
import { SidePanelService } from './services/side-panel.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { WebSocketService } from './services/websocket.service';
import { GraphService } from './services/apis/graph.service';
import { PrivilegesService } from './services/privileges.service';
import { ScanJobsService } from './services/apis/scanjobs.service';
import { ScopesService } from './services/apis/scopes.service';
import { FactoryUtilsService } from './services/factory-utils.service';
import { SearchService } from './services/apis/search.service';
import { MetamodelService } from './services/apis/metamodel.service';
import { SyncService } from './services/apis/sync.service';
import { TenantService } from './services/apis/tenant.service';
import { UserService } from './services/apis/user.service';
import { ITExplorerService } from './services/apis/it-explorer.service';

import { RequestInterceptor } from './interceptors/request.interceptor';

import { AppComponent } from './app.component';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MatSnackBarModule,
    MatButtonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    LoginModule,
    MainModule,
    RouterModule.forRoot([]),
    NgProgressModule.forRoot({ spinnerPosition: 'left' }),
    NgProgressHttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    AuthService,
    ToastrService,
    AuditService,
    UtilsService,
    ApiService,
    AppliancesService,
    LocationsService,
    LoginService,
    SummaryService,
    ITUService,
    MenuService,
    ReportsService,
    GlobalStorageService,
    ErrorService,
    NavigationService,
    SidePanelService,
    BreadcrumbService,
    WebSocketService,
    GraphService,
    PrivilegesService,
    ScanJobsService,
    ScopesService,
    FactoryUtilsService,
    SearchService,
    MetamodelService,
    SyncService,
    TenantService,
    UserService,
    ITExplorerService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private breadcrumbService: BreadcrumbService) {}
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { GaugeModule } from 'angular-gauge';
import { ChartsModule } from 'ng2-charts';
import { TooltipModule } from 'ngx-tooltip';
import { NouisliderModule } from 'ng2-nouislider';
import {
  MatButtonModule,
  MatTableModule,
  MatCardModule,
  MatListModule,
  MatMenuModule,
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

import { ComponentsModule } from '../../components/components.module';
import { AuditComponent } from './audit.component';
import { EventsComponent } from './events/events.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CountsComponent } from './counts/counts.component';

const routes: Routes = [{
  path: '', component: AuditComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, data: { title: 'AUDIT.DASHBOARD.NAME' } },
    { path: 'events', component: EventsComponent, data: { title: 'AUDIT.EVENTS.NAME' } },
    { path: 'counts', component: CountsComponent, data: { title: 'AUDIT.COUNTS.NAME' } },
    { path: '**', component: DashboardComponent, data: { title: 'AUDIT.DASHBOARD.NAME' } }
  ]
}];

@NgModule({
  declarations: [
    AuditComponent,
    EventsComponent,
    DashboardComponent,
    CountsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GaugeModule.forRoot(),
    ClipboardModule,
    TooltipModule,
    ChartsModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatListModule,
    MatMenuModule,
    TranslateModule,
    ComponentsModule,
    NouisliderModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class AuditModule { }

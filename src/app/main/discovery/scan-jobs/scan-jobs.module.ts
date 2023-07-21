import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../../components/components.module';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatMenuModule,
  MatButtonModule,
  MatTableModule,
  MatSelectModule,
  MatInputModule,
  MatSliderModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatSortModule,
  MatTooltipModule,
  MatPaginatorModule,
  MatDialogModule,
  MatTabsModule,
  MatCheckbox
} from '@angular/material';
import { MdePopoverModule } from '@material-extended/mde';
import { Routes, RouterModule } from '@angular/router';
import { ScanJobPopupComponent } from './scan-job/scan-job-details/scan-job-popup/scan-job-popup.component';
import { ScanJobLogComponent } from './scan-job/scan-job-details/scan-job-log/scan-job-log.component';
import { ScanJobResultComponent } from './scan-job/scan-job-details/scan-job-result/scan-job-result.component';
import {
  ScanJobsListComponent,
  BadConfigCell,
  NotRunYetCell
} from './scan-jobs-list/scan-jobs-list.component';
import { ScanJobComponent, ScanJobResolver } from './scan-job/scan-job.component';
import { ScanJobDetailsComponent } from './scan-job/scan-job-details/scan-job-details.component';
import { ScanJobConfigComponent } from './scan-job/scan-job-config/scan-job-config.component';
import { ScanJobsComponent } from './scan-jobs.component';
import * as _ from 'lodash';

const appRoutes: Routes = [
  { path: '', component: ScanJobsComponent, children: [
    { path: '', component: ScanJobsListComponent, data: { linked: true } },
    { path: ':id', component: ScanJobComponent, resolve: {scanJob: ScanJobResolver}, children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      { path: 'details', component: ScanJobDetailsComponent, data: { title: 'DISCOVERY.SCAN_JOBS.DETAILS' } },
      { path: 'configure', component: ScanJobConfigComponent, data: { title: 'DISCOVERY.SCAN_JOBS.CONFIG' } }
    ]}
  ]}
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    MatMenuModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSortModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTabsModule,
    MdePopoverModule,
    RouterModule.forChild(appRoutes)
  ],
  providers: [DatePipe, DecimalPipe, ScanJobResolver],
  declarations: [
    ScanJobsComponent,
    ScanJobsListComponent,
    ScanJobPopupComponent,
    ScanJobLogComponent,
    ScanJobResultComponent,
    ScanJobComponent,
    ScanJobDetailsComponent,
    ScanJobConfigComponent,
    BadConfigCell,
    NotRunYetCell
  ],
  entryComponents: [
    ScanJobPopupComponent,
    MatCheckbox
  ],
  exports: []
})
export class ScanJobsModule {}

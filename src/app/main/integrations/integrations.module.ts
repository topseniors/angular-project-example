import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IntegrationsComponent } from './integrations.component';
import { IntegrationsListComponent } from './integrations-list/integrations-list.component';
import { IntegrationComponent, SyncSystemIntegrationResolver } from './integration/integration.component';

const appRoutes: Routes = [
  { path: '', component: IntegrationsComponent, children: [
    { path: '', component: IntegrationsListComponent },
    { path: ':systemName', component: IntegrationComponent, resolve: { syncSystemIntegration: SyncSystemIntegrationResolver } }
  ] }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(appRoutes)
  ],
  providers: [SyncSystemIntegrationResolver],
  declarations: [
    IntegrationsComponent,
    IntegrationsListComponent,
    IntegrationComponent
  ],
  exports: []
})
export class IntegrationsModule { }

import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ItExplorerComponent } from './it-explorer.component';

const appRoutes: Routes = [{
  path: '',
  children: [{
    path: '', redirectTo: 'application', pathMatch: 'full'
  }, {
    path: ':any', component: ItExplorerComponent, data: { title: 'IT_EXPLORER.NAME' }
  }]
}];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(appRoutes)
  ],
  declarations: [
    ItExplorerComponent,
  ],
  exports: []
})
export class ItExplorerModule { }

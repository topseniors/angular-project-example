import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {
  MatListModule,
  MatInputModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule,
  MatMenuModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  MatCheckbox,
  MatCheckboxModule
} from '@angular/material';
import { CodemirrorModule } from '@nomadreservations/ngx-codemirror';
import { MdePopoverModule } from '@material-extended/mde';
import { SearchComponent } from './search.component';
import { DoSearchComponent } from './do-search/do-search.component';
import { ManageSavedSearchesComponent } from './manage-saved-searches/manage-saved-searches.component';

const appRoutes: Routes = [{ path: '', component: SearchComponent, children: [
  { path: '', redirectTo: 'do-search', pathMatch: 'full' },
  { path: 'do-search', component: DoSearchComponent, data: { title: 'SEARCH.DO_SEARCH.RESULTS_FOR_EMPTY' } },
  { path: 'manage-saved-searches', component: ManageSavedSearchesComponent, data: { title: 'SEARCH.MANAGE_SAVED_SEARCHES.TITLE' } }
] }];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    CodemirrorModule,
    MdePopoverModule,
    RouterModule.forChild(appRoutes)
  ],
  declarations: [
    SearchComponent,
    DoSearchComponent,
    ManageSavedSearchesComponent
  ],
  entryComponents: [
    MatCheckbox
  ],
  exports: []
})
export class SearchModule { }

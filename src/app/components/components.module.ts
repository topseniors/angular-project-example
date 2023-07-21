import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCardModule,
  MatGridListModule,
  MatMenuModule,
  MatButtonModule,
  MatIconModule,
  MatTableModule,
  MatTooltipModule,
  MatSortModule,
  MatPaginatorModule,
  MatInputModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatSidenavModule,
  MatIconRegistry
} from '@angular/material';
import { MdePopoverModule } from '@material-extended/mde';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { ButtonComponent } from './button/button.component';
import { InputComponent } from './input/input.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UserInfoModalComponent } from './user-info-modal/user-info-modal.component';
import { IntegrationModalComponent } from './integration-modal/integration-modal.component';
import { SaveSearchModalComponent } from './save-search-modal/save-search-modal.component';
import { EditSearchModalComponent } from './edit-search-modal/edit-search-modal.component';
import { FolderModalComponent } from './folder-modal/folder-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { MenuComponent } from './menu/menu.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { SectionComponent } from './section/section.component';
import { DateRendererComponent } from './date-renderer/date-renderer.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { TreemapComponent } from './treemap/treemap.component';
import { GraphViewComponent } from './graph-view/graph-view.component';
import { NodeComponent } from './graph-view/node.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DependencyGraphComponent } from './dependency-graph/dependency-graph.component';
import { GenericOutletComponent } from './generic-outlet/generic-outlet.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TableActionsButtonComponent } from './table-actions-button/table-actions-button.component';
import { ProgressBar } from './progress-bar/progress-bar.component';
import { NotificationComponent } from './notification/notification.component';
import { EffectIconComponent } from './effect-icon/effect-icon.component';
import { DateTimeCell } from './date-time-cell/date-time-cell.component';
import { SuperTableComponent, CustomCellDirective, ExpandedRowDirective } from './super-table/super-table.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { AlertPanelComponent } from './alert-panel/alert-panel.component';

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    UserInfoModalComponent,
    IntegrationModalComponent,
    SaveSearchModalComponent,
    EditSearchModalComponent,
    FolderModalComponent,
    ChangePasswordModalComponent,
    MenuComponent,
    NotificationComponent,
    TopMenuComponent,
    SectionComponent,
    DateRendererComponent,
    SidePanelComponent,
    BreadcrumbComponent,
    LineChartComponent,
    TreemapComponent,
    GraphViewComponent,
    NodeComponent,
    CheckboxComponent,
    DependencyGraphComponent,
    GenericOutletComponent,
    CalendarComponent,
    TableActionsButtonComponent,
    ProgressBar,
    EffectIconComponent,
    SuperTableComponent,
    ConfirmationModalComponent,
    AlertPanelComponent,
    DateTimeCell,
    CustomCellDirective,
    ExpandedRowDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MdePopoverModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSidenavModule,
    NgJsonEditorModule
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    UserInfoModalComponent,
    IntegrationModalComponent,
    SaveSearchModalComponent,
    EditSearchModalComponent,
    FolderModalComponent,
    ChangePasswordModalComponent,
    MenuComponent,
    NotificationComponent,
    TopMenuComponent,
    SectionComponent,
    DateRendererComponent,
    SidePanelComponent,
    LineChartComponent,
    TreemapComponent,
    GraphViewComponent,
    CheckboxComponent,
    DependencyGraphComponent,
    GenericOutletComponent,
    TableActionsButtonComponent,
    ProgressBar,
    EffectIconComponent,
    SuperTableComponent,
    ConfirmationModalComponent,
    AlertPanelComponent,
    DateTimeCell,
    TranslateModule,
    MatCardModule,
    MatGridListModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSidenavModule,
    NgJsonEditorModule,
    CustomCellDirective,
    ExpandedRowDirective
  ],
  providers: [
    MatIconRegistry,
    DatePipe
  ],
  entryComponents: [
    TableActionsButtonComponent,
    DateRendererComponent,
    ProgressBar,
    NotificationComponent,
    EffectIconComponent,
    NodeComponent,
    DateTimeCell,
    UserInfoModalComponent,
    IntegrationModalComponent,
    SaveSearchModalComponent,
    EditSearchModalComponent,
    FolderModalComponent,
    ChangePasswordModalComponent,
    ConfirmationModalComponent,
  ]
})
export class ComponentsModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}

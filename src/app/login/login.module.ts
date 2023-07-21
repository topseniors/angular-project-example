import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material';

import { LoginComponent } from './login.component';
import { NetAnimComponent } from './net-anim/net-anim.component';

const appRoutes: Routes = [
  { path : '', redirectTo : 'login', pathMatch : 'full' },
  { path : 'login', component : LoginComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    NetAnimComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    MatCheckboxModule,
    TranslateModule,
    RouterModule.forRoot(appRoutes)
  ]
})
export class LoginModule { }

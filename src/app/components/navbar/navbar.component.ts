import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UserInfoModalComponent } from '../user-info-modal/user-info-modal.component';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { LoginService, UserData } from '../../services/apis/login.service';

@Component({
  selector    : 'app-navbar',
  templateUrl : './navbar.component.html',
  styleUrls   : ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {
  @Input() pinned: boolean;

  userData: UserData;

  constructor(private router: Router,
    private dialog: MatDialog,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.userData = this.loginService.getUserData();
  }

  public openUserInfoModal(): void {
    const { orgId, userId, userName, login, email, userPrefList } = this.userData;
    const parsedUserPrefList = JSON.parse(userPrefList);
    const userTimeZone = parsedUserPrefList.ui.tz;
    const dialogRef = this.dialog.open(UserInfoModalComponent, {
      width: '500px',
      panelClass: 'user-info-modal',
      data: { orgId, userId, userName, login, email, userTimeZone, parsedUserPrefList }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe(result => {
        if (!result) return;
        this.userData = this.loginService.getUserData();
      });
  }

  public openChangePasswordModal(): void {
    const { orgId, userId } = this.userData;
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '500px',
      panelClass: 'change-password-modal',
      data: { orgId, userId }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe();
  }

  public logout(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: {
        confirmTitle: 'GENERAL.LOG_OUT',
        message: 'GENERAL.LOG_OUT_CONFIRMATION',
        confirmAction: 'GENERAL.LOG_OUT'
      }
    });
    const subscriber = dialogRef.afterClosed()
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.loginService.logout();
          this.router.navigate(['/login']);
        }
      });
  }
}

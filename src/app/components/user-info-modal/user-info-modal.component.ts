import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { TenantService, TimeZone, TimeZoneAPIResult } from '../../services/apis/tenant.service';
import { UserService, UserInfoUpdatePayload, UserAPIResult } from '../../services/apis/user.service';

class UserInfoErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'user-info-modal',
  templateUrl: 'user-info-modal.component.html',
  styleUrls: ['./user-info-modal.component.less']
})
export class UserInfoModalComponent implements OnInit {

  fullNameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(64),
    Validators.pattern(`[^0-9!"\#$%&()*+,\-/:;<=>?@\[\\\]^_{|}~]+`)
  ]);
  userNameFormControl = new FormControl('', []);
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(1024)
  ]);
  timeZoneFormControl = new FormControl('', []);
  formGroup = new FormGroup({
    fullName: this.fullNameFormControl,
    userName: this.userNameFormControl,
    email: this.emailFormControl,
    timeZone: this.timeZoneFormControl
  });

  matcher = new UserInfoErrorStateMatcher();

  constructor(
    public tenantService: TenantService,
    public userService: UserService,
    public dialogRef: MatDialogRef<UserInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    const subscriber = this.tenantService.getAvailableApplianceTimeZones(this.data.orgId)
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result: TimeZoneAPIResult) => {
        this.data.timeZones = (result.success) ? result.data : [{ id: 'Etc/GMT' }];
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const { userId, userName, login, email, userTimeZone, parsedUserPrefList } = this.data;
    const updatePayload: UserInfoUpdatePayload = {
      name: userName,
      login,
      email,
      preferences: {
        ...parsedUserPrefList,
        ui: {
          tz: userTimeZone
        }
      }
    };
    const subscriber = this.userService.updateUserInfo(userId, updatePayload)
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result: UserAPIResult) => {
        if (result.success) {
          this.dialogRef.close(true);
        }
      });
  }
}

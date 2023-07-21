import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, AbstractControl, FormGroupDirective, NgForm, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { TenantService, PasswordPolicy, PasswordPolicyAPIResult } from '../../services/apis/tenant.service';
import { UserService, UserPasswordUpdatePayload, UserAPIResult } from '../../services/apis/user.service';

class ChangePasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const invalidState = !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));

    if (control.parent.controls['confirmPassword'] !== control) return invalidState;

    const misMatchCompare = (control.parent.controls['newPassword'].value !== control.value);
    if (misMatchCompare && (control.dirty || control.touched || isSubmitted)) {
      control.setErrors({ 'matchpair': { value: control.value } });
    } else {
      control.setErrors(null);
    }
    return misMatchCompare && (control.dirty || control.touched || isSubmitted);
  }
}

function matchPairValidator(pairFormControl: FormControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const mismatch = control.value !== pairFormControl.value;
    return mismatch ? { 'matchpair': { value: control.value } } : null;
  };
}

const patterns = [
  `.*`,
  `^(?=.*[a-z]).*`,
  `^(?=.*[A-Z]).*`,
  `^(?=.*[a-z])(?=.*[A-Z]).*`,
  `^(?=.*\\d).*`,
  `^(?=.*[a-z])(?=.*\\d).*`,
  `^(?=.*[A-Z])(?=.*\\d).*`,
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*`,
  `^(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[a-z])(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[A-Z])(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*\\d)(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[a-z])(?=.*\\d)(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[A-Z])(?=.*\\d)(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`,
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_\`{|}~]).*`
];

const patternMessages = [
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_0',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_1',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_2',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_3',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_4',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_5',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_6',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_7',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_8',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_9',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_10',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_11',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_12',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_13',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_14',
  'GENERAL.NEW_PASSWORD_PATTERN_MESSAGE_15'
];

interface ComposedPasswordPolicy {
  minLength: number;
  pattern: string;
  patternMessage: string;
}

@Component({
  selector: 'change-password-modal',
  templateUrl: 'change-password-modal.component.html',
  styleUrls : ['./change-password-modal.component.less']
})
export class ChangePasswordModalComponent implements OnInit {

  passwordPolicy: PasswordPolicy;
  composedPasswordPolicy: ComposedPasswordPolicy = {
    minLength: 0,
    pattern: '',
    patternMessage: ''
  };
  formControlsInitialized = false;

  patternIndex = 0;

  formGroup: FormGroup;
  currentPasswordFormControl: FormControl;
  newPasswordFormControl: FormControl;
  confirmPasswordFormControl: FormControl;

  matcher = new ChangePasswordErrorStateMatcher();

  input = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    public tenantService: TenantService,
    public userService: UserService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orgId: string, userId: string }
  ) { }

  ngOnInit() {
    const subscriber = this.tenantService.getPasswordPolicy(this.data.orgId)
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result: PasswordPolicyAPIResult) => {
        this.passwordPolicy = (result.success) ? result.data[0] : null;
        this.parsePasswordPolicy();
        this.initializeFormControls();
        this.formControlsInitialized = true;
      });
  }

  parsePasswordPolicy(): void {
    const {
      minimumLength,
      requiredLowercase,
      requiredUppercase,
      requiredNumeric,
      requiredSpecial
    } = this.passwordPolicy;
    const policyBinary = [0, 0, 0, 0];

    if (requiredSpecial > 0) policyBinary[0] = 1;
    if (requiredNumeric > 0) policyBinary[1] = 1;
    if (requiredUppercase > 0) policyBinary[2] = 1;
    if (requiredLowercase > 0) policyBinary[3] = 1;
    this.patternIndex = parseInt(policyBinary.join(''), 2);

    this.composedPasswordPolicy = {
      minLength: minimumLength,
      pattern: patterns[this.patternIndex],
      patternMessage: patternMessages[this.patternIndex]
    };
  }

  initializeFormControls(): void {
    this.currentPasswordFormControl = new FormControl('', [
      Validators.required,
      Validators.maxLength(1024)
    ]);
    this.newPasswordFormControl = new FormControl('', [
      Validators.required,
      Validators.maxLength(1024),
      Validators.minLength(this.composedPasswordPolicy.minLength),
      Validators.pattern(this.composedPasswordPolicy.pattern)
    ]);
    this.confirmPasswordFormControl = new FormControl('', [
      Validators.required,
      matchPairValidator(this.newPasswordFormControl)
    ]);
    this.formGroup = new FormGroup({
      currentPassword: this.currentPasswordFormControl,
      newPassword: this.newPasswordFormControl,
      confirmPassword: this.confirmPasswordFormControl
    });
  }

  getPasswordRecommendationMessage(): string {
    const patternMessage = this.translate.instant(this.composedPasswordPolicy.patternMessage);
    const recommendationPatternMessage = (this.patternIndex === 0) ? patternMessage.substring(13) : patternMessage.substring(20);

    return this.translate.instant('GENERAL.PASSWORD_RECOMMENDATION_INITIAL') + ' ' +
      this.composedPasswordPolicy.minLength + ' ' +
      this.translate.instant('GENERAL.PASSWORD_RECOMMENDATION_MIDDLE') + ' ' +
      recommendationPatternMessage;
  }

  getNewPasswordMinLengthMessage(): Observable<string> {
    return this.translate.get('GENERAL.NEW_PASSWORD_MIN_LENGTH', { length: this.composedPasswordPolicy.minLength });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const { userId } = this.data;
    const { currentPassword, newPassword, confirmPassword } = this.input;
    const updatePayload: UserPasswordUpdatePayload = {
      id: userId,
      oldpassword: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    };
    const subscriber = this.userService.updateUserPassword(userId, updatePayload)
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

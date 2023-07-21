import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, AbstractControl, FormGroupDirective, NgForm, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import * as _ from 'lodash';
import { SyncService, APIResult } from '../../services/apis/sync.service';

interface JsonEditorNode {
  field: string;
  path: string[];
  value: any;
}

class IntegrationErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const invalidState = !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));

    if (control.parent.controls['confirmPassword'] !== control) return invalidState;

    const misMatchCompare = (control.parent.controls['password'].value !== control.value);
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

@Component({
  selector: 'integration-modal',
  templateUrl: './integration-modal.component.html',
  styleUrls: ['./integration-modal.component.less']
})
export class IntegrationModalComponent implements OnInit {

  integrationTypes = [
    {
      label: 'INTEGRATIONS.SERVICE_NOW',
      value: 'servicenow'
    }, {
      label: 'INTEGRATIONS.APSCOUT',
      value: 'apscout'
    }
  ];
  testing = null;
  testResultSuccess = null;
  isAdvancedView = false;
  currentJsonEditorMode = 'tree';

  integrationTypeFormControl = new FormControl({ value: '', disabled: (this.data.mode === 'EDIT') }, [
    Validators.required
  ]);
  integrationNameFormControl = new FormControl({ value: '', disabled: (this.data.mode === 'EDIT') }, [
    Validators.required,
    Validators.maxLength(64)
  ]);
  realtimeSyncFormControl = new FormControl({ value: '', disabled: (!this.testResultSuccess && !this.data.realtimeSync) });
  serverUrlFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(1024)
  ]);
  portFormControl = new FormControl('', [
    Validators.required,
    Validators.min(0),
    Validators.max(65535),
    Validators.pattern(/^\d+$/)
  ]);
  loginFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(64)
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(64)
  ]);
  confirmPasswordFormControl = new FormControl('', [
    Validators.required,
    matchPairValidator(this.passwordFormControl)
  ]);

  formGroup = new FormGroup({
    integrationType: this.integrationTypeFormControl,
    integrationName: this.integrationNameFormControl,
    realtimeSync: this.realtimeSyncFormControl,
    serverUrl: this.serverUrlFormControl,
    port: this.portFormControl,
    login: this.loginFormControl,
    password: this.passwordFormControl,
    confirmPassword: this.confirmPasswordFormControl
  });

  matcher = new IntegrationErrorStateMatcher();

  public jsonEditorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent) jsonEditor: JsonEditorComponent;

  constructor(
    public translate: TranslateService,
    public syncService: SyncService,
    public dialogRef: MatDialogRef<IntegrationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.jsonEditorOptions = new JsonEditorOptions();
    this.jsonEditorOptions.modes = ['tree', 'code', 'text', 'view'];
    this.jsonEditorOptions.onModeChange = (newMode: string) => {
      this.currentJsonEditorMode = newMode;
    };
    this.jsonEditorOptions.onEditable = (node: JsonEditorNode) => {
      if (_.isEmpty(node)) return true;

      if (this.data.mode === 'NEW') return { field: true, value: true };

      if (node.field === 'name' && node.path && node.path.length === 1 && node.path[0] === 'name') {
        return { field: false, value: false };
      }
      if (node.field === 'systemType' && node.path && node.path.length === 1 && node.path[0] === 'systemType') {
        return { field: false, value: false };
      }
      return { field: false, value: true };
    };
  }

  ngOnInit(): void {
    const { login } = this.data.syncSystem;
    login.confirmPassword = login.password;
  }

  trimField(field: string): void {
    let fieldValue = null;

    switch (field) {
      case 'name':
        fieldValue = this.data.syncSystem.name;
        break;
      case 'serverUrl':
        fieldValue = this.data.syncSystem.host;
        break;
      case 'port':
        fieldValue = this.data.syncSystem.port;
        break;
      case 'login':
        fieldValue = this.data.syncSystem.login.user;
        break;
      default:
        break;
    }

    if (fieldValue) {
      fieldValue = fieldValue.toString().trim();
    }
  }

  testConnection(): void {
    const payload = JSON.parse(JSON.stringify(this.data.syncSystem));
    payload.port = parseInt(payload.port, 10);
    delete payload.login.confirmPassword;

    this.testing = true;
    const subscriber = this.syncService.testSyncSystem(payload)
      .finally(() => {
        subscriber.unsubscribe();
        this.testing = false;
      })
      .subscribe((result: APIResult<any>) => {
        this.testResultSuccess = result.success;
        this.data.realtimeSync = this.testResultSuccess;
      }, (error: any) => {
        this.testResultSuccess = false;
        this.data.realtimeSync = false;
      });
  }

  toggleAdvancedView(): void {
    this.isAdvancedView = !this.isAdvancedView;
    if (this.isAdvancedView) {
      return (this.dialogRef as any)._overlayRef.overlayElement.classList.add('integration-modal-advanced');
    }

    (this.dialogRef as any)._overlayRef.overlayElement.classList.remove('integration-modal-advanced');
  }

  cancelJson(): void {
    this.toggleAdvancedView();
  }

  saveJson(): void {
    this.data.syncSystem = {
      ...this.jsonEditor.get(),
      name: this.data.syncSystem.name,
      systemType: this.data.syncSystem.systemType
    };
    this.toggleAdvancedView();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    let submit$ = null;
    const payload = JSON.parse(JSON.stringify(this.data.syncSystem));
    payload.port = parseInt(payload.port, 10);
    delete payload.login.confirmPassword;

    if (this.data.mode === 'NEW') {
      submit$ = this.syncService.createSyncSystem(payload);
    } else {
      submit$ = this.syncService.updateSyncSystem(payload);
    }

    const subscriber = submit$
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe(() => {
        const result = { needInit: this.data.realtimeSync, systemName: this.data.syncSystem.name };
        this.dialogRef.close(result);
      });
  }
}

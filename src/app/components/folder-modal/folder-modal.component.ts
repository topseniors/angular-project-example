import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as _ from 'lodash';
import { SearchService, APIResult, SaveFolderPayload } from '../../services/apis/search.service';

class FolderErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'folder-modal',
  templateUrl: './folder-modal.component.html',
  styleUrls: ['./folder-modal.component.less']
})
export class FolderModalComponent {

  folderNameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(64),
    Validators.pattern(/.*\S.*/)
  ]);
  folderDescriptionFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);
  formGroup = new FormGroup({
    folderName: this.folderNameFormControl,
    folderDescription: this.folderDescriptionFormControl
  });
  matcher = new FolderErrorStateMatcher();

  constructor(
    public searchService: SearchService,
    public dialogRef: MatDialogRef<FolderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  trimFolderName(): void {
    if (this.data.name) {
      this.data.name = this.data.name.trim();
    }
  }

  isAddMode(): boolean {
    return this.data.mode === 'NEW';
  }

  isEditMode(): boolean {
    return this.data.mode === 'EDIT';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const pureData = _.omit(this.data, ['mode']);
    const payload: SaveFolderPayload = <SaveFolderPayload>{ data: pureData };
    let submitFunc$ = null;

    if (this.isAddMode()) {
      submitFunc$ = this.searchService.createFolder(payload);
    } else {
      submitFunc$ = this.searchService.updateFolder(payload);
    }

    const subscriber = submitFunc$
      .finally(() => {
        subscriber.unsubscribe();
      })
      .subscribe((result: APIResult<any>) => {
        if (result.success) {
          this.dialogRef.close(true);
        }
      });
  }
}

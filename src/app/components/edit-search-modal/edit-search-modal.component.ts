import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SearchService, APIResult, SaveSearchPayload } from '../../services/apis/search.service';

class EditSearchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'edit-search-modal',
  templateUrl: './edit-search-modal.component.html',
  styleUrls: ['./edit-search-modal.component.less']
})
export class EditSearchModalComponent {

  searchNameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(64),
    Validators.pattern(/.*\S.*/)
  ]);
  searchDescriptionFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);
  searchTermFormControl = new FormControl('', [
    Validators.maxLength(256),
    Validators.pattern(/.*\S.*/)
  ]);
  formGroup = new FormGroup({
    searchName: this.searchNameFormControl,
    searchDescription: this.searchDescriptionFormControl,
    searchTerm: this.searchTermFormControl
  });
  matcher = new EditSearchErrorStateMatcher();

  constructor(
    public searchService: SearchService,
    public dialogRef: MatDialogRef<EditSearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  trimSearchName(): void {
    if (this.data.name) {
      this.data.name = this.data.name.trim();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const payload: SaveSearchPayload = { data: this.data };
    const subscriber = this.searchService.updateSearch(payload)
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

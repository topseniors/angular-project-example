import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { APIResult } from '../../services/apis/api.service';
import { SearchService, Folder, Search } from '../../services/apis/search.service';

class SaveSearchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'save-search-modal',
  templateUrl: './save-search-modal.component.html',
  styleUrls: ['./save-search-modal.component.less']
})
export class SaveSearchModalComponent implements OnInit {

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(64),
    Validators.pattern(/.*\S.*/)
  ]);
  descriptionFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);
  folderFormControl = new FormControl('', [Validators.required]);
  formGroup = new FormGroup({
    name: this.nameFormControl,
    description: this.descriptionFormControl,
    folder: this.folderFormControl
  });
  matcher = new SaveSearchErrorStateMatcher();

  folders: Folder[];
  output: any = {
    name: '',
    description: '',
    selectedFolder: ''
  };

  constructor(
    public searchService: SearchService,
    public dialogRef: MatDialogRef<SaveSearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    const sub = this.searchService.getFolders()
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe((result: APIResult<Folder>) => {
        this.folders = result.data.filter((iterator: Folder) => (iterator.name !== 'System Searches'));
      });
  }

  trimName(): void {
    if (this.output.name) {
      this.output.name = this.output.name.trim();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const { entityType, searchString, searchMode } = this.data;
    const { name, description, selectedFolder } = this.output;
    const saveSearchPayload = {
      data: {
        entity: entityType,
        folderId: selectedFolder,
        name,
        q: searchString,
        searchMode,
        shortDescr: description
      }
    };

    const sub = this.searchService.createSearch(saveSearchPayload)
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe((result: APIResult<Search>) => {
        if (result.success) {
          this.dialogRef.close(true);
        }
      });
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector    : 'app-checkbox',
  templateUrl : './checkbox.component.html',
  styleUrls   : ['./checkbox.component.less']
})
export class CheckboxComponent implements OnInit {
  @Input('ngModel') value: boolean;
  @Input() label: string;
  @Input() disabled: boolean;

  constructor() { }

  ngOnInit() {}

  updateCheck() {
    if(this.disabled) {
      return;
    }

    this.value = !this.value;

    return false;
  }
}

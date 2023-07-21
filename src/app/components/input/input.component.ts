import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector    : 'app-input',
  templateUrl : './input.component.html',
  styleUrls   : ['./input.component.less']
})
export class InputComponent implements OnInit {
  @Input('ngModel') value: string;
  @Input() inputLabel: string;
  @Input() placeholder: string;
  @Input() type: string;

  constructor() {}

  ngOnInit() {}
}

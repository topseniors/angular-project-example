import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.less']
})
export class ButtonComponent implements OnInit {
  @Input() btnIcon: string;
  @Input() btnLabel: string;
  @Input() disabled: boolean;

  constructor() { }

  ngOnInit() {
  }

}

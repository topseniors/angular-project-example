import { Component, Input } from '@angular/core';

export interface EffectIcon {
  extension?: string;
  icon: string;
  effect?: string;
  title?: string;
}

@Component({
  selector: 'effect-icon',
  templateUrl: './effect-icon.component.html',
  styleUrls: ['./effect-icon.component.less']
})
export class EffectIconComponent implements EffectIcon {
  @Input() extension? = '.png';
  @Input() icon: string;
  @Input() effect?: string; // 'blinking' | 'spinning';
  @Input() title?: string;
}

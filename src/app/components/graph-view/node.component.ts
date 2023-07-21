import {Component,Input,ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'g[node-component]',
  template: `<svg:g>\
               <rect fill="url(#nodeGradient)" stroke="#249AE7" stroke-width="3" rx="8" ry="8" width="50" height="30"/>\
               <image [attr.xlink:href]="nodeData.icon" transform="translate(5 15)" width="58px" height="66px" xlink:href="resources/usericon_female1.svg"></image>\
               <text transform="translate(0 45)" width="50" style="text-align: center; font-size:10px; font-family:Arial; fill:#505050">{{nodeData.name}}</text>\
             </svg:g>'`
})
export class NodeComponent {
  @Input() public nodeData: any;

  constructor(private changeDetector: ChangeDetectorRef) {
    this.nodeData = {};

    // When a NodeComponent is displayed in the GraphComponent,
    // we need to poll for changes manually, because the node visualization is not part
    // of the regular Angular 2 component hierarchy.
    setTimeout(() => this.changeDetector.detectChanges(), 0);
    setInterval(() => this.changeDetector.detectChanges(), 500);
  }
}

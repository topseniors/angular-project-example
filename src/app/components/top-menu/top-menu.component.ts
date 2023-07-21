import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.less']
})

export class TopMenuComponent implements OnInit {
  @Input() menuItems;
  hiddenItems = [];
  startX = 280;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
  }

  ngDoCheck() {
     this.updateMenuItems();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateMenuItems();
  }

  updateMenuItems() {
    let menu = this.elementRef.nativeElement.childNodes[0];
    let max = _.maxBy(this.menuItems, (btn: any) => { return btn.width });
    let menuWidth = menu.offsetWidth - this.startX - (max? max.width: 0);

    let buttons = _.filter(menu.childNodes, function(btn: any) {
      return btn.className && btn.className.indexOf('menu-button') != -1;
    });

    let total = 0;
    this.hiddenItems = [];
    _.each(buttons, (btn, index) => {
      if(this.menuItems[index]) {
        this.menuItems[index].width = this.menuItems[index].width || btn.offsetWidth;
        total += this.menuItems[index].width;
        this.menuItems[index].hidden = total > menuWidth;

        if(this.menuItems[index].hidden) {
          this.hiddenItems.push(this.menuItems[index]);
        }
      }
    });
  }
}

import {
    Component, Input, OnInit, OnDestroy,
    ViewChild, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef
} from '@angular/core';

import { IGenericCard } from '../cards/generic-card.interface';
import { AppSummaryComponent } from '../cards/app-summary.component';
import { ServerSummaryComponent } from '../cards/server-summary.component';
import { CloudSummaryComponent } from '../cards/cloud-summary.component';
import { AppOverviewComponent } from '../cards/app-overview.component';

@Component({
  selector: 'dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.less']
})
export class DashboardCardComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input() type: string;
  @Input() title: string;
  @Input() filter: any;
  @Input() action: any;
  @Input() width: number;
  @Input() height: number;

  private mappings = {
    'appSummary': AppSummaryComponent,
    'serverSummary': ServerSummaryComponent,
    'cloudSummary': CloudSummaryComponent,
    'appOverview': AppOverviewComponent
  };

  private componentRef: ComponentRef<{}>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  getComponentType(typeName: string) {
    return this.mappings[typeName];
  }

  getStyle() {
    return {
      height: this.height * 136 + 'px'
    };
  }

  getClass() {
    return {
      'col-xs-12': this.width <= 12,
      'col-sm-6': this.width <= 6,
      'col-md-4': this.width <= 4,
      'col-lg-3': this.width <= 3
    };
  }

  ngOnInit() {
    if (this.type) {
      let componentType = this.getComponentType(this.type);
      let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      this.componentRef = this.container.createComponent(factory);
      let instance = <IGenericCard>this.componentRef.instance;
      this.action = instance.action;
      this.filter = instance.filter;
    }
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}

import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector    : 'app-breadcrumb',
  templateUrl : './breadcrumb.component.html',
  styleUrls   : ['./breadcrumb.component.less']
})
export class BreadcrumbComponent {
  @Input() pinned: boolean;

  private segments: ActivatedRoute[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {
    this.segments = [];

    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        this.routeChanged(event);
      }
    });
  }

  private routeChanged(event: any) {
    this.segments.length = 0;

    this.generateBreadcrumbTrail(this.router.routerState.root.firstChild);
  }

  private generateBreadcrumbTrail(route: ActivatedRoute): void {
    route.children.forEach(childRoute => {
      if (childRoute.outlet === 'primary') {
        if (childRoute.snapshot.url.length > 0 && !childRoute.snapshot.data['ignore']) {
          this.segments.push(childRoute);
        }

        this.generateBreadcrumbTrail(childRoute);
      }
    });
  }

  private navigateTo(route: ActivatedRoute): void {
    this.router.navigateByUrl(this.breadcrumbService.buildUrl(route));
  }

  private routeName(route: ActivatedRoute): string {
    return this.breadcrumbService.getLabel(route);
  }
}

import { Injectable } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Injectable()
export class BreadcrumbService {
  private _lastUrl: string;

  get lastUrl(): string {
    return this._lastUrl;
  };

  private labels: Map<string, string>;

  constructor(private router: Router) {
    this.labels = new Map<string, string>();

    router.events.filter(e => e instanceof NavigationEnd)
      .subscribe((e: NavigationEnd) => {
        this._lastUrl = e.url;
      });
  }

  public buildUrl(route: ActivatedRoute): string {
    let url = '';

    route.pathFromRoot.forEach((parentRoute: ActivatedRoute) => {
      if (parentRoute.snapshot.url.length > 0) {
        url += `/${parentRoute.snapshot.url.map(({path}) => path).join('/')}`;
      }
    });

    return url;
  }

  public addLabel(route: ActivatedRoute, label: string) {
    this.labels.set(this.buildUrl(route), label);
  }

  public addCustomLabel(url: string, label: string) {
    this.labels.set(url, label);
  }

  public getLabel(route: ActivatedRoute): string {
    let label = this.labels.get(this.buildUrl(route));

    if (!label) {
      // tslint:disable:no-string-literal
      label = route.snapshot.data['title'];
    }

    if (!label) {
      label = 'unknown';
    }

    return label;
  }
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title, DomSanitizer, SafeValue } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Subject } from 'rxjs/Rx';
import { MenuService } from 'app/services/apis/menu.service';
import { LoginService } from 'app/services/apis/login.service';
import { BreadcrumbService } from 'app/services/breadcrumb.service';

@Component({
  selector    : 'app-main',
  templateUrl : './main.component.html',
  styleUrls   : ['./main.component.less']
})
export class MainComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef;

  initialURL: SafeValue = '';
  showOldVersion = false;

  private isOpened       : boolean = false;
  private isPinned       : boolean = false;
  private autoFocus      : boolean = false;
  private trapFocus      : boolean = false;
  private dock           : boolean = true;
  private sidebarMode    : string  = 'over';
  private keepMenuOpened : boolean = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    public titleService: Title,
    private breadcrumbService: BreadcrumbService,
    public loginService: LoginService,
    public router: Router,
    public menuService: MenuService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const scanJobId = this.activatedRoute.snapshot.queryParamMap.get('scanJobId');
    let {iframeUrl, showOldVersion} = this.menuService.getIframeParams(this.router.url);

    if (scanJobId) {
      iframeUrl += `/${scanJobId}`;
    }

    this.showOldVersion = showOldVersion;
    this.initialURL     = this.sanitize(iframeUrl);

    this.router.events.subscribe((event: any) => {
      if (!event.url) {
        return;
      }

      if (event instanceof NavigationEnd) {
        let {iframeUrl, showOldVersion} = this.menuService.getIframeParams(event.url);
        const shouldPush = event.url.indexOf('/open') === -1;
        const breadcrumbLabel = this.menuService.getLabel(this.router.url);
        const scanJobId = this.activatedRoute.snapshot.queryParamMap.get('scanJobId');

        if (scanJobId) {
          iframeUrl += `/${scanJobId}`;
        }

        this.showOldVersion = showOldVersion;

        this.breadcrumbService.addCustomLabel(this.router.url, breadcrumbLabel);

        if (shouldPush && this.showOldVersion && this.iframe && this.iframe.nativeElement.contentWindow) {
          // this.iframe.nativeElement.contentWindow.history.pushState('string', 'Title', iframeUrl);
          this.iframe.nativeElement.contentWindow.location.hash = `#${iframeUrl.split('#')[1]}`;
        }
      }
    });

    this.menuService.changeIframeHash$.subscribe(({className, oid, tab}) => {
      if (this.iframe && this.iframe.nativeElement.contentWindow) {
        const itExplorerUrl = this.menuService.getItUniverseSearchUrl();
        const iframeUrl = `${itExplorerUrl}/${className}/${oid}/${tab}`;

        this.iframe.nativeElement.contentWindow.history.pushState('string', 'Title', iframeUrl);
      }
    });

    const subs = this.menuService.menuFetchSuccess$.subscribe(() => {
      const {iframeUrl, showOldVersion} = this.menuService.getIframeParams(this.router.url);
      const breadcrumbLabel = this.menuService.getLabel(this.router.url);

      this.breadcrumbService.addCustomLabel(this.router.url, breadcrumbLabel);

      this.showOldVersion = showOldVersion;
      this.initialURL     = this.sanitize(iframeUrl);

      subs.unsubscribe();
    });

    const redirectSusbs = this.menuService.customRedirect$.subscribe(({url, ...rest}) => {
      if (this.iframe && this.iframe.nativeElement.contentWindow) {
        const {className, oid, tab} = rest;
        const itExplorerUrl = this.menuService.getItUniverseSearchUrl();
        const iframeUrl = `${itExplorerUrl}/${className}/${oid}/${tab}`;

        this.iframe.nativeElement.contentWindow.history.pushState('string', 'Title', iframeUrl);
      }

      setTimeout(() => {
        this.router.navigate([url, rest])
      }, 1500);
    });

    setTimeout(() => {
      const isLargeScreen = window.innerWidth > 1440;

      this.isOpened    = isLargeScreen;
      this.isPinned    = isLargeScreen;
      this.sidebarMode = this.isPinned ? 'push' : 'over';
    });

    const { orgName, userName } = this.loginService.getUserData();

    if (orgName && userName) {
      this.titleService.setTitle(`${orgName} - ${userName}`);
    }
  }

  sanitize(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private expandSidebar() {
    if (!this.isPinned && !this.isOpened) {
      this.isOpened = true;
    }
  }

  private collapseSidebar() {
    if (this.keepMenuOpened) {
      return;
    }

    if (!this.isPinned && this.isOpened) {
      this.isOpened = false;
    }
  }

  private keepOpened({keepMenuOpened}) {
    this.keepMenuOpened = keepMenuOpened;
  }

  private togglePinned() {
    this.isPinned    = !this.isPinned;
    this.isOpened    = this.isPinned;
    this.sidebarMode = this.isPinned ? 'push' : 'over';
  }
}

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector    : 'app-sencha-discovery',
  templateUrl : './sencha-discovery.component.html',
  styleUrls   : ['./sencha-discovery.component.less']
})
export class SenchaDiscoveryComponent implements OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe((params: Params) => {
        let intervalHandler;

        if (params.default === 'addScanJob') {
          intervalHandler = setInterval(() => {
            if (document.getElementsByClassName('iframe-container').length > 0) {
              (document.getElementsByClassName('iframe-container')[0] as any).contentWindow
                .eval(`
                  var innerHandler = setInterval(function() {
                    if (ITS && ITS.app) {
                      var ctr = ITS.app.getController("wizard.scanwizardcontroller");
                      ctr.showWizard();
                      clearInterval(innerHandler);
                    }
                  }, 1000);
                `);
              clearInterval(intervalHandler);
            }
          }, 1000);
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

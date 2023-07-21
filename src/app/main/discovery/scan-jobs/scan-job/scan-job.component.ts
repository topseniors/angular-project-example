import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, RouterStateSnapshot, ActivatedRoute, ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ScanJobsService, ScanJob } from '../../../../services/apis/scanjobs.service';
import { BreadcrumbService } from '../../../../services/breadcrumb.service';

@Component({
  selector: 'scan-job',
  templateUrl: './scan-job.component.html',
  styleUrls: ['./scan-job.component.less']
})
export class ScanJobComponent {

  private scanJob: ScanJob = this.route.snapshot.data.scanJob;

  constructor(
    private route: ActivatedRoute,
    private scanJobsService: ScanJobsService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.addLabel(this.route, this.scanJob.name);
  }
}

@Injectable()
export class ScanJobResolver implements Resolve<ScanJob> {
  constructor(private scanJobsService: ScanJobsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ScanJob> {
    const id = route.paramMap.get('id');

    return this.scanJobsService.getScanJob(id).take(1).map(scanJob => {
      if (scanJob) {
        return scanJob;
      } else { // id not found
        this.router.navigate(['..']);
        return null;
      }
    }).share();
  }
}

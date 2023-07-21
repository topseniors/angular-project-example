import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BreadcrumbService } from '../../../../../services/breadcrumb.service';
import { AppliancesService, Appliance } from '../../../../../services/apis/appliances.service';
import { LocationsService, Location } from '../../../../../services/apis/locations.service';
import { ScanJobsService, ScanJob, ScanType } from '../../../../../services/apis/scanjobs.service';
import * as _ from "lodash";
import * as moment from "moment";
import * as hammerjs from "hammerjs";

@Component({
  selector: 'scan-job-config',
  templateUrl: './scan-job-config.component.html',
  styleUrls: ['./scan-job-config.component.less']
})
export class ScanJobConfigComponent {

  private scanTypes: Array<string> = ['Sequential', 'Credentialess', 'Application', 'Neighbourhood'];
  private lastUrl: string = this.breadcrumbService.lastUrl;
  private scanJob: ScanJob = this.route.parent.snapshot.data.scanJob;
  private duration: number = this.scanJob.maxDuration || 0;

  // async
  private appliances$: Observable<Appliance[]> = this.appliancesService.getAppliances();
  private locations$: Observable<Location[]> = this.locationsService.getLocations();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private locationsService: LocationsService,
              private appliancesService: AppliancesService,
              private scanJobsService: ScanJobsService,
              private breadcrumbService: BreadcrumbService) { }

  private back(){
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private cancel(){
    this.router.navigate([this.lastUrl || '..'], { relativeTo: this.route });
  }

  private save(){
    // TODO
  }

  private toTime(mins: number): string {
    return Math.floor(mins/60)+' h';
  }
}

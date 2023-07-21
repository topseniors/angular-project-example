import { Component, OnInit, Input } from '@angular/core';
import { SidePanelService } from '../../services/side-panel.service';
import { Router , ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.less']
})
export class SidePanelComponent implements OnInit {
  @Input() panelTitle = "";
  state: any;

  constructor(private sidePanelService: SidePanelService,
              private router: Router,
              private route: ActivatedRoute) {
    this.state = sidePanelService;
  }

  ngOnInit() {
  }

  close() {
    this.sidePanelService.close();
    this.router.navigate(['..'], { relativeTo: this.route });
  }

}

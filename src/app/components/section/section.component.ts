import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.less']
})
export class SectionComponent implements OnInit {
  @Input() sectionIcon = "";
  @Input() sectionTitle = "";
  @Input() subTitle = "";
  @Input() menuItems = [];
  @Input() loading = false;
  @Input() blueHeader = false;

  constructor(private navigationService: NavigationService, private route: ActivatedRoute) { }

  ngOnInit() {
  }
}

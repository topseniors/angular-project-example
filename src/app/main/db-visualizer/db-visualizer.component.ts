import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-db-visualizer',
  templateUrl: './db-visualizer.component.html',
  styleUrls: ['./db-visualizer.component.less']
})
export class DbVisualizerComponent implements OnInit {

  settings = {
    columns: {
    },
    actions: undefined,
    hideSubHeader: true
  };

  data = [

  ];

  constructor() { }

  ngOnInit() {
  }

}

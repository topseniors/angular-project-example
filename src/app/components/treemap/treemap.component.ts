import { Component, OnInit, Input, ElementRef} from '@angular/core';

import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: 'app-treemap',
  template: `
    <div (window:resize)="update()" class="treemap"></div>
  `,
  styleUrls: ['./treemap.component.less']
})
export class TreemapComponent implements OnInit {

  @Input() data;
  private svg;
  private width;
  private height;
  private fader;
  private format;
  private color;
  private treemap;
  private id;

  constructor(private elementRef: ElementRef) {
    this.id = "treemap_" + Math.floor(Math.random() * 1e9);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: any) {
    if(!_.isEmpty(changes.data.currentValue)){
      this.drawTree(changes.data.currentValue);
    }
  }

  drawTree(data) {
    this.svg = d3.select(this.elementRef.nativeElement)
      .append("svg")
      .attr("id", this.id)
      .attr("width", '100%')
      .attr("height", '100%');

    this.width = parseInt(this.svg.style("width"));
    this.height = parseInt(this.svg.style("height"));
    this.fader = function(color) { return d3.interpolateRgb(color, "#444")(0.1); };
    this.color = d3.scaleOrdinal(d3.schemeCategory10.map(this.fader));
    this.format = d3.format(",d");
    this.treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([this.width, this.height])
      .round(true)
      .paddingInner(1);

    var root = d3.hierarchy(data)
      .eachBefore((d) => { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
      .sum(this.sumBySize)
      .sort((a, b) => { return b.height - a.height || b.value - a.value; });

    this.treemap(root);

    var cell = this.svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", (d) => { return "translate(" + d.x0 + "," + d.y0 + ")"; });

    cell.append("rect")
      .attr("id", (d) => { return d.data.id; })
      .attr("width", (d) => { return d.x1 - d.x0; })
      .attr("height", (d) => { return d.y1 - d.y0; })
      .attr("fill", (d) => { return '#01b5de' });

    cell.append("clipPath")
      .attr("id", (d) => { return "clip-" + d.data.id; })
      .append("use")
      .attr("xlink:href", (d) => { return "#" + d.data.id; });

    cell.append("text")
      .attr("clip-path", (d) => { return "url(#clip-" + d.data.id + ")"; })
      .selectAll("tspan")
      .data((d) => { return d.data.name.split(/ /g); })
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => { return 13 + i * 10; })
      .text((d) => { return d; }).each(this.wrap);
  }

  update() {
    d3.select("#" + this.id).remove();
    this.drawTree(this.data);
  }

  sumByCount(d) {
    return d.children ? 0 : 1;
  }

  sumBySize(d) {
    return d.size;
  }

  wrap() {
    var self = d3.select(this as any),
      textLength = self.node().getComputedTextLength(),
      text = self.text();

    while (textLength > (this.width) && text.length > 0) {
      text = text.slice(0, -1);
      self.text(text + '...');
      textLength = self.node().getComputedTextLength();
    }
  }
}

import { Component, OnInit, Input, ElementRef} from '@angular/core';

import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: 'dependency-graph',
  template: `
    <div (window:resize)="update()" class="dependency-graph"></div>
  `,
  styleUrls: ['./dependency-graph.component.less']
})
export class DependencyGraphComponent implements OnInit {

  graph: any;
  _nodes: any[];
  _edges: any[];

  @Input('nodes')
  set nodes(value: any[]) {
      this._nodes = _.map(value, (node) => {
        return {
          id: node.id,
          name: node.name,
          group: Math.floor(Math.random() * 4)
        }
      });
      if(!_.isEmpty(this._edges))
        this.drawGraph();
  }

  @Input('edges')
  set edges(value: any[]) {
      this._edges = _.map(value, (edge) => {
        return {
          "source": edge.from,
          "target": edge.to,
          "value": 10
        }
      });
      if(!_.isEmpty(this._nodes))
        this.drawGraph();
  }

  private svg;
  private width;
  private height;
  private simulation;
  private radius = 14;
  private textOffsetY = 20;
  private color = d3.scaleOrdinal(d3.schemeCategory10);
  private id;

  constructor(private elementRef: ElementRef) {
    this.id = "graph_" + Math.floor(Math.random() * 1e9);
  }

  ngOnInit() {

  }

  drawGraph() {
    this.svg = d3.select(this.elementRef.nativeElement)
      .append("svg")
      .attr("id", this.id)
      .attr("width", '100%')
      .attr("height", '100%');

    this.width = parseInt(this.svg.style("width"));
    this.height = parseInt(this.svg.style("height"));

    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d:any) => { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    var link = this.svg.append("g")
    .attr("class", "links")
    .selectAll("path")
    .data(this._edges)
    .enter().append("path")
    .attr("class", "link flowline")
    .attr("stroke", "rgba(0,0,0,.5)")
    .attr("stroke-width", 1);

    var node = this.svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this._nodes)
      .enter()
      .append("circle")
        .attr("r", 5)
        .attr("fill", (d) => { return this.color(d.group) })
        .call(d3.drag()
          .on("start", (d) => { this.dragstarted(d) })
          .on("drag", (d) => { this.dragged(d) })
          .on("end", (d) => { this.dragended(d) }));
    node.append("div")
      .text((d) => { return d.name; });

    this.simulation
        .nodes(this._nodes)
        .on("tick", ticked);

    this.simulation.force("link")
        .links(this._edges);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
  }

  dragstarted(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

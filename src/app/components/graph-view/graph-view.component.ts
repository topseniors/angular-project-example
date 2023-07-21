import {
    Component, AfterViewInit, ElementRef, Injector, Input, Output, EventEmitter,
    Compiler, ComponentFactoryResolver
} from '@angular/core';
import { NodeComponentStyle } from './NodeComponentStyle';
import { NodeComponent } from "./node.component";
import * as _ from "lodash";

@Component({
  selector: 'graph-view',
  template: `<div class="graph-component-container"></div>`,
  styleUrls: ['./graph-view.component.less']
})
export class GraphViewComponent {
  _nodes: any[];
  _edges: any[];

  @Input('nodes')
  set nodes(value: any[]) {
      this._nodes = value;
      if(!_.isEmpty(this._edges))
        this.updateGraph();
  }

  @Input('edges')
  set edges(value: any[]) {
      this._edges = value;
      if(!_.isEmpty(this._nodes))
        this.updateGraph();
  }

  @Output() currentItem:EventEmitter<any> = new EventEmitter();

  // _graphComponent:yfiles.view.GraphComponent;
  // constructor(private _element:ElementRef,
  //             private _injector:Injector,
  //             private _resolver:ComponentFactoryResolver) {
  // }

  updateGraph() {
    // var containerDiv:HTMLDivElement = this._element.nativeElement.getElementsByClassName("graph-component-container")[0];
    // this._graphComponent = new yfiles.view.GraphComponent(containerDiv);
    //
    // this._graphComponent.inputMode = new yfiles.input.GraphViewerInputMode();
    // this._graphComponent.minimumZoom = .2;
    // this._graphComponent.maximumZoom = 1.3;
    // this._graphComponent.mouseWheelZoomFactor = 1.1;
    // // let viewportLimiter = new yfiles.view.ViewportLimiter();
    // // viewportLimiter.bounds = new yfiles.geometry.Rect(0, 0, 1000, 1000);
    // // this._graphComponent.viewportLimiter = viewportLimiter;
    //
    // (<any>this._graphComponent).addCurrentItemChangedListener((sender:yfiles.view.GraphComponent, args)=> {
    //   var currentNode:yfiles.graph.INode = <yfiles.graph.INode>sender.currentItem;
    //   var currentNodeData = currentNode.tag;
    //   this.currentItem.emit(currentNodeData);
    // });
    //
    // var graphBuilder = new yfiles.binding.GraphBuilder(this._graphComponent.graph);
    //
    // graphBuilder.graph.nodeDefaults.style = new NodeComponentStyle(this._injector, this._resolver);
    // graphBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(50, 50);
    //
    // graphBuilder.nodeIdBinding = "id";
    // graphBuilder.sourceNodeBinding = "from";
    // graphBuilder.targetNodeBinding = "to";
    //
    // // assign the nodes and edges source - filter the nodes
    // graphBuilder.nodesSource = this._nodes;
    // graphBuilder.edgesSource = this._edges;
    //
    // // build the graph from the source data
    // var graph = graphBuilder.buildGraph();
    //
    // this._graphComponent.graph = graph;
    //
    // this._doLayout();
    // this._graphComponent.fitGraphBounds();
  }

 // private _createTreeLayout():yfiles.layout.ILayoutAlgorithm {
    // var gtl = new yfiles.hierarchic.HierarchicLayout();
    // var /**yfiles.tree.TreeReductionStage*/ treeReductionStage = new yfiles.tree.TreeReductionStage();
    // treeReductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter();
    // treeReductionStage.nonTreeEdgeSelectionKey = yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY;
    //
    // gtl.appendStage(treeReductionStage);
    // return gtl;
  //}

  private _doLayout():void {
    // this._graphComponent.graph.applyLayout(this._createTreeLayout());
  }

}

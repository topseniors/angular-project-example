import { Component, ViewChild, Input } from '@angular/core';
import * as _ from 'lodash';
import * as d3 from 'd3';

export interface ProgressChannel {
  key: string;
  name: string;
  color: string;
  count: number;
}
export interface ProgressData {
  total: number;
  progress: number;
  channels: ProgressChannel[];
}
export interface ProgressInput {
  data: ProgressData;
  onTooltipItemClicked?: () => void;
}
interface ViewModel {
  x: number;
  width: number;
  color: string;
}

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.less']
})
export class ProgressBar implements ProgressInput {

  @Input() width = 200;
  @Input() height = 16;

  private _data: ProgressData;
  @Input() set data(data: ProgressData){
    this._data = data;
    if (data) this.update(data);
  }

  @Input() onTooltipItemClicked: () => void;

  private static readonly borderWidth = 2;
  private pct = 0;
  private background;

  constructor() {
    if (!this.onTooltipItemClicked) {
      this.onTooltipItemClicked = () => {};
    }
  }

  @ViewChild('svg') svg: {nativeElement: SVGSVGElement};

  private update(data: ProgressData): void {
    this.pct = data.progress;
    const nChannels = (data.channels || []).length;
    const borderPadding = ProgressBar.borderWidth * (nChannels - 1);
    const xScale = d3.scaleLinear().domain([0, data.total]).range([0, this.width - borderPadding]);
    const viewData: ViewModel[] = data.channels.reduce((a, b, i, c) => {
      const width = xScale(b.count);
      const x = (i === 0) ? 0 : a[i - 1].x + a[i - 1].width + ProgressBar.borderWidth;
      const color = b.color;
      a.push({ x, width, color});
      return a;
    }, []);
    const svg = d3.select(this.svg.nativeElement);

    const update = svg.select('g.data').selectAll('rect.data').data(viewData);
    const enter = update.enter();
    const exit = update.exit();

    enter.append('svg:rect')
      .attr('y', 0)
      .attr('class', 'data')
      .attr('x', (d: ViewModel) => d.x)
      .attr('height', this.height)
      .attr('width', (d: ViewModel) => d.width)
      .attr('fill', (d: ViewModel) => d.color);
    update
      .attr('x', (d: ViewModel) => d.x)
      .attr('height', this.height)
      .attr('width', (d: ViewModel) => d.width)
      .attr('fill', (d: ViewModel) => d.color);
    exit.remove();
  }
}

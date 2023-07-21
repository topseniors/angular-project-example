import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import { TimerObservable } from "rxjs/observable/TimerObservable";
import * as _ from 'lodash';

@Component({
  selector: 'net-anim',
  templateUrl: './net-anim.component.html'
})

export class NetAnimComponent implements OnInit {
  private particles: any[];
  private canvasWidth: number;
  private canvasHeight: number;
  private padding = 117;
  private subscription: Subscription;
  private ctx: CanvasRenderingContext2D;

  @Input('animation') animation: boolean;

  @ViewChild('myCanvas') canvasRef: ElementRef;

  constructor(private elem: ElementRef) {
  }

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.canvasWidth = this.elem.nativeElement.offsetWidth;
    this.canvasHeight = this.elem.nativeElement.offsetHeight;
    this.ctx.canvas.width = this.canvasWidth
    this.ctx.canvas.height = this.canvasHeight

    this.generatePoints();
    this.draw();

    if (this.animation) {
      let timer = TimerObservable.create(0, 50);
      this.subscription = timer.subscribe(t => {
        this.draw();
      });
    }
  }

  generatePoints() {
    let partNum = Math.min(300, this.canvasWidth * this.canvasHeight * .0004);
    this.particles = _.map(_.range(0, partNum), () => {
      return {
        x: Math.random() * (this.canvasWidth + 2 * this.padding) - this.padding,
        y: Math.random() * (this.canvasHeight + 2 * this.padding) - this.padding,
        sx: (Math.random() * 4 - 2) * .5,
        sy: (Math.random() * 4 - 2) * .5,
        r: Math.random() * 2 + 1,
        d: Math.random() * 0.3
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.canvasWidth = this.elem.nativeElement.offsetWidth;
    this.canvasHeight = this.elem.nativeElement.offsetHeight;
    this.ctx.canvas.width = this.canvasWidth
    this.ctx.canvas.height = this.canvasHeight
    this.generatePoints();
    if (!this.animation) this.draw();
  }

  mouseOver(event) {
    this.particles[0].x = event.clientX;
    this.particles[0].y = event.clientY;
    this.particles[0].sx = 0;
    this.particles[0].sy = 0;
    this.particles[0].r = 0;
  }

  mouseOut(event) {
    this.particles[0].sx = (Math.random() * 2 - 1) * .5;
    this.particles[0].sy = (Math.random() * 2 - 1) * .5;
    this.particles[0].r = Math.random() * 2 + 1;
  }

  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    let len = this.particles.length;
    for (let i = 0; i < len; i++) {
      let p1 = this.particles[i];
      for (let j = i + 1; j < len; j++) {
        let p2 = this.particles[j];
        let dist = this.dist2points(p1.x, p1.y, p2.x, p2.y);
        if(dist < this.padding) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = "rgba(255, 255, 255, " + ((1 - dist/this.padding) * 0.4) + ")";
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 255, 255, " + p1.d + ")";
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    };


    this.update();
  }

  update() {
		let angle = 0;

    _.each(this.particles, part => {
      part.x += part.sx;
      part.y += part.sy;
      if(part.x > this.canvasWidth + this.padding) {
        part.x = -this.padding;
      } else if(part.x < -this.padding) {
        part.x = this.canvasWidth + this.padding;
      } else if(part.y > this.canvasHeight + this.padding) {
        part.y = -this.padding;
      } else if(part.y < - this.padding) {
        part.y = this.canvasHeight + this.padding;
      }
    });
	}

  dist2points(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

}

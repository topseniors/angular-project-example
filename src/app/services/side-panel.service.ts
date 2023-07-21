import { Injectable } from '@angular/core';

@Injectable()
export class SidePanelService {

  opened: boolean;

  constructor() { }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }
}

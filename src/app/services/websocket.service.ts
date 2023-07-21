import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs/Rx';

@Injectable()
export class WebSocketService {

  private subject = {};
  private ws = {};

  constructor() { }

  public connect(key, url, onOpen, onClose): Subject<MessageEvent> {
    if (!this.subject[key]) {
      this.subject[key] = this.create(key, url, onOpen, onClose);
    }
    return this.subject[key];
  }

  private create(key, url, onOpen, onClose): Subject<MessageEvent> {
    this.ws[key] = new WebSocket(url);

    const observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        this.ws[key].onmessage = obs.next.bind(obs);
        this.ws[key].onerror = () => { obs.error.bind(obs); onClose(true); };
        this.ws[key].onopen = () => onOpen();
        this.ws[key].onclose = () => { obs.complete.bind(obs); onClose(false); };
        return this.ws[key].close.bind(this.ws[key]);
      });
    const observer = {
      next: (data: Object) => {
        if (this.ws[key].readyState === WebSocket.OPEN) {
          this.ws[key].send(JSON.stringify(data));
        }
      }
    };
    return Subject.create(observer, observable);
  }

  public send(key, data): void {
    if (this.ws[key] && this.ws[key].readyState === WebSocket.OPEN) {
      this.ws[key].send(JSON.stringify(data));
    }
  }

  public disconnect(key) {
    if (this.ws[key]) {
      this.ws[key].close();
      delete this.ws[key];
      delete this.subject[key];
    }
  }

  public disconnectAll() {
    const keys = Object.keys(this.ws);
    for (let i = 0; i < keys.length; i++) {
      this.ws[keys[i]].close();
      delete this.ws[keys[i]];
      delete this.subject[keys[i]];
    }
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class GlobalStorageService {
  cache = {};
  localStorageSupport = true;

  constructor() {}

  public storeLocal (key, value) {
    const storedValue = typeof value === 'object' ? JSON.stringify(value) : value;

    this.cache[key] = storedValue;

    try {
      window.localStorage.setItem(key, storedValue);
    } catch (err) {
      this.localStorageSupport = false;

      this.createCookie(key, storedValue);
    }
  }

  public removeLocal (key) {
    delete this.cache[key];

    try {
      window.localStorage.removeItem(key);

      this.createCookie(key, null, -1);
    } catch (err) {
      this.createCookie(key, null, -1);
    }
  }

  public getLocal (key) {
    if (!this.cache[key]) {
      try {
        let value;

        try {
          value = JSON.parse(window.localStorage.getItem(key));
        } catch (err) {
          value = window.localStorage.getItem(key);
        }

        if (!value) {
          try {
            value = JSON.parse(this.fetchFromCookie(key));
          } catch (err) {
            value = this.fetchFromCookie(key);
          }
        }

        this.cache[key] = value;

        return value;
      } catch (err) {
        try {
          return JSON.parse(this.fetchFromCookie(key));
        } catch (err) {
          return this.fetchFromCookie(key);
        }
      }
    } else {
      try {
        return JSON.parse(this.cache[key]);
      } catch (err) {
        return this.cache[key];
      }
    }
  }

  fetchFromCookie (key) {
    const value = this.readCookie(key);

    this.cache[key] = value;

    return value;
  }

  createCookie (key: string, value: string, exp: number = null) {
    const date: Date = new Date();

    date.setTime(date.getTime() + ((exp || 30) * 24 * 60 * 60 * 1000));

    const expires = '; expires=' + date.toUTCString();

    document.cookie = key + '=' + value + expires + '; path=/';
  }

  readCookie (key) {
    const nameEQ = key + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }
}

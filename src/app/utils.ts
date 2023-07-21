import * as moment from 'moment';

export default class Utils {

  public static string2number(s: string): number {
    if (s === '' || isNaN(+s)) throw 'Not a valid number: ' + s;
    return +s;
  }

  public static string2boolean(s: string): boolean {
    switch (s) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw 'Not a valid boolean: ' + s;
    }
  }

  public static formatNumber(n: number, digits: number = 2, warn: boolean = true): string {
    if (digits < 1) throw 'digits need to be a strictly positive number: ' + digits;
    if ((digits < ('' + n).length) && warn) console.warn(n + ' will be truncated at ' + digits + ' digits');
    let padding: string = ''; for (let i = 0; ++i < digits;) padding += '0';
    return (padding + n).slice(-digits);
  }

  public static formatDuration(duration: moment.Duration) {
    return (duration === undefined) ? '00:00' :
      Utils.formatNumber(duration.hours()) + ':' + Utils.formatNumber(duration.minutes()) + ':' + Utils.formatNumber(duration.seconds());
  }

  public static closestByClass(el: any, clazz: string) {
    while (el && !el.classList.contains(clazz)) {
      el = el.parentNode;
    }
    return el;
  }

}

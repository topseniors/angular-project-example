import { Component, OnInit } from '@angular/core';
import { CalendarComponent as FullCalendar } from "angular2-fullcalendar/src/calendar/calendar";

@Component({
  selector   : 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls  : ['./calendar.component.less']
})
export class CalendarComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

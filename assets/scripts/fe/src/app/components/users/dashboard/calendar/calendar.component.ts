import { Component, OnInit, Input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as _ from 'lodash';
import * as moment from 'moment';

import { ServerService } from 'src/app/commons/services/auth/server.service';
import { FeedService } from 'src/app/commons/services/utils/feed.service';
import { EventFormComponent } from './event-form/event-form.component';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  isCollapsed : boolean;
  firstWeek   : Array<Date> = [];
  weeks       : Array<Date> = [];

  private _month          : number;
  private _year           : number;
  private _now            : Date;
  private _calendarEvents : Array<any> = [];

  constructor(
    private server: ServerService,
    private feed  : FeedService,
    private modal : NgbModal
  ) {
    this.isCollapsed = true;
    this._now         = this.server.now;
    this._month       = this._now.getMonth();
    this._year        = this._now.getFullYear();

    // Fetch calendar events before any other calendar action.
    this.feed.getCalendarEvents(String(this._year))
      .then((events: Array<any>) => {
        this._calendarEvents  = events;
        this.firstWeek        = this._firstWeek();
        this.weeks            = this._weeks();
      });

  }

  ngOnInit() {
  }

  private _prevMonthLastDate(): Date {
    return new Date(this._year, this._month, 0);
  }

  private _currMonthFirstDate(): Date {
    return new Date(this._year, this._month, 1);
  }

  private _currMonthLastDate(): Date {
    return new Date(this._year, this._month + 1, 0);
  }

  /**
   * Get current month's firstweek including prev month's idle dates.
   */
  private _firstWeek(): Array<any> {
    const currMonthFirstDateWeekIdx = this._currMonthFirstDate().getDay();
    const prevMonth                 = this._month - 1;
    const prevMonthDatesCount       = currMonthFirstDateWeekIdx;
    const prevMonthDates            = [];

    // Check if the current month's first date is not monday
    // If true, push prev month dates to prevMonthDates array.
    if (currMonthFirstDateWeekIdx !== 0) {
      _.times(prevMonthDatesCount, (idx) => {
        const prevMonthDate = this._prevMonthLastDate().getDate() - idx;
        const dateInstance = new Date(this._year, prevMonth, prevMonthDate);
        prevMonthDates.push({
          date: dateInstance,
          events: this._getDateEvents(dateInstance)
        });
      });

      // Reverse the array since we started pushing from
      // prevMonthLastDate backwards.
      prevMonthDates.reverse();
    }

    // Combine prev month dates and current month dates
    // then return only the first 7 dates as the first week.
    return [...prevMonthDates, ...this._currMonthDates()].slice(0, 7);
  }

  /**
   * Get current month's lastweek including next month's idle dates.
   */
  private _lastWeek(): Array<any> {
    const currMonthLastDateWeekIdx = this._currMonthLastDate().getDay();
    const nextMonth                = this._month + 1;
    const nextMonthDatesCount      = 6 - currMonthLastDateWeekIdx;
    const nextMonthDates           = [];

    // Check if the current month's last date is not saturday
    // If true, push next month dates to nextMonthDates array.
    if (currMonthLastDateWeekIdx !== 6) {
      _.times(nextMonthDatesCount, (idx) => {
        const nextMonthDate = idx + 1;
        const dateInstance = new Date(this._year, nextMonth, nextMonthDate);
        nextMonthDates.push({
          date: dateInstance,
          events: this._getDateEvents(dateInstance)
        });
      });
    }

    // Combine next month dates and current month dates
    // then return only the last 7 dates as the last week.
    return [...this._currMonthDates(), ...nextMonthDates].slice(this._currMonthDates.length - 6);
  }

  /**
   * Get current month's dates not including idle dates.
   */
  private _currMonthDates(): Array<any> {
    const datesCount = this._currMonthLastDate().getDate();
    const dates      = [];

    // Push current month dates into dates array.
    _.times(datesCount, (idx) => {
      const date = idx + 1;
      const dateInstance = new Date(this._year, this._month, date);
      dates.push({
        date: dateInstance,
        events: this._getDateEvents(dateInstance)
      });
    });

    return dates;
  }

  /**
   * Get currnent month's dates divided into several weeks
   * 7 dates per week.
   */
  private _weeks(): Array<any> {
    const prevMonthShownDate = this._firstWeek().filter(date => date.date.getMonth() !== this._month);
    const nextMonthShownDate = this._lastWeek().filter(date => date.date.getMonth() !== this._month);
    return _.chunk([
      ...prevMonthShownDate,
      ...this._currMonthDates(),
      ...nextMonthShownDate
    ], 7);
  }

  /**
   * Get events that belongs or triggered to the given `date`.
   * @param date `Date` instance.
   */
  private _getDateEvents(date: Date) {
    return this._calendarEvents
      .filter(e => {
        const { freq_day, freq_mo, freq_week_idx, event_date } = e;
        const day     = String(date.getDate());
        const mo      = String(date.getMonth() + 1);
        const weekIdx = String(date.getDay());
        const anyVal  = '*';

        const once    = event_date === moment(date).format('YYYY-MM-DD');
        const daily   = freq_day === anyVal && freq_mo === anyVal && freq_week_idx === anyVal;
        const weekly  = freq_day === anyVal && freq_mo === anyVal && freq_week_idx === weekIdx;
        const monthly = freq_day === day && freq_mo === anyVal && freq_week_idx === anyVal;
        const yearly  = freq_day === day && freq_mo === mo && freq_week_idx === anyVal;

        return (once || daily || weekly || monthly || yearly);
      });
  }

  /**
   * @summary Generate object of css classes for a `date`
   * @param date Insatance of Date;
   * @description Can be use for ngClass directive
   */
  getDateClass(date: Date): {'idleDay': boolean, 'today': boolean} {
    return {
      'idleDay': date.getMonth() !== this._month,
      'today': date.getDate() === this._now.getDate()
    };
  }

  toggleEventForm(popover, calendarDate): void {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open({ calendarDate, popover });
    }
  }

  openModalForm({ eventInstance, eventDate }) {
    const modalRef = this.modal.open(EventFormComponent);
    // pass `eventDate` and `eventInstance` into `EventFormComponent`
    modalRef.componentInstance.eventDate = eventDate;
    modalRef.componentInstance.eventInstance  = eventInstance;

    // Push the added event into `_calendarEvents`
    modalRef.result
      .then(({event, action}) => {
        // update `this._calendarEvents` base on action
        switch (action) {
          case 'create':
            this._calendarEvents.push(event);
            break;
          case 'update':
            const eventIdx = this._calendarEvents.findIndex(e => e.id === event.id);
            this._calendarEvents[eventIdx] = event;
            break;
          case 'delete':
            this._calendarEvents = this._calendarEvents.filter(e => e.id !== event.id);
            break;
        }

        // Update `firstWeek` and `weeks` so we would not need
        // to refresh the browser
        this.firstWeek = this._firstWeek();
        this.weeks     = this._weeks();
      })
      // Have to catch dismiss reason to avoid uncaught promise.
      .catch(reason => {
        // log modal dismiss reason e.g. ( "backdrop click", "cross click")
        console.log('Dismiss reason:', reason);
      });
  }

}

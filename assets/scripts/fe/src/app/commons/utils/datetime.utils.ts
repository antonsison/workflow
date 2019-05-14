import * as _ from 'lodash';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

export function DateRange (date:Date = new Date) {
    var dt = date;
    var currentWeekDay = dt.getDay();

    var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;

    // get the start of the week date
    var wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
    // get the end of the week date
    var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

    var dateRange = {
        'dateStart': wkStart,
        'dateEnd': wkEnd
    }
    return dateRange
}

export function GetPreviousDate(date:Date, interval:number){
    // get the previous date based on the given interval
    let intervalDate = new Date(new Date(date).setDate(date.getDate() - interval))

    return intervalDate
}

export function GetMonthFirstLastDate(date:Date, interval:number){
    // get the previous month based on the given interval
    var intervalDate = new Date(new Date(date).setMonth(date.getMonth() - interval))

    // compute the first and last day of the month
    var firstOfMonth = new Date(intervalDate.getFullYear(), intervalDate.getMonth(), 1);
    var lastOfMonth = new Date(intervalDate.getFullYear(), intervalDate.getMonth()+1, 0);

    var MonthFirstLastDate = { 
        'firstOfMonth':firstOfMonth, 
        'lastOfMonth':lastOfMonth 
    }

    return MonthFirstLastDate
}

export function FormatDateToString(date:Date){
    // returns date string in YYYY-MM-dd format
    return `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
}

export function ConvertFromNgbDate(date:NgbDate){
    // convert NgbDate into Date
    return new Date(date.year, date.month-1, date.day);
}

export function ConvertToNgbDate(date:Date){
    // convert NgbDate into Date
    return new NgbDate(date.getFullYear(), (date.getMonth() + 1), date.getDate());
}
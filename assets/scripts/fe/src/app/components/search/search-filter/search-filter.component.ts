import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../../commons/services/utils/feed.service'
import { StandupService } from '../../../commons/services/history/standup.service'
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

import { DateRange, GetPreviousDate, GetMonthFirstLastDate, 
  ConvertFromNgbDate } from '../../../commons/utils/datetime.utils'

import { ProjectService } from '../../../commons/services/project/project.service'
import { SearchService } from '../../../commons/services/utils/search.service';
import { StateService } from '@uirouter/angular';


@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.css']
})
export class SearchFilterComponent implements OnInit {

  // used by bootstrap datetimepicker
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  // boolean to enable disable apply date filter button
  ApplyFilterChange:boolean = false;

  constructor(
    private feed    : FeedService,
    private standupservice : StandupService,
    private calendar       : NgbCalendar,
    private project : ProjectService,
    private search  : SearchService,
    private state   : StateService
  ) {
    // set fromdate to today for calendar
    this.fromDate = calendar.getToday();
  }

  ngOnInit() {
    // set default date range for calendar
    this.standupservice.dateData = DateRange();
  }

  ApplyDateFilter($event){
    if(!this.search.fetching){
      // set date data to be passed
      this.standupservice.setDateData(this.fromDate, this.toDate)
      this.getSearched() 
    }
  }

  FilterByDays($event, interval){
    if(!this.search.fetching){
      // set initial toDate to Date Today
      this.toDate = this.calendar.getToday();
      // get previous date
      let convertedDate:Date = GetPreviousDate(ConvertFromNgbDate(this.toDate), interval);
      // convert previous date to NgbDate Format
      this.fromDate = new NgbDate(convertedDate.getFullYear(), (convertedDate.getMonth() + 1), convertedDate.getDate());
      // disable aplly filter button
      this.ApplyFilterChange = false;

      // if interval is 1 or yesterday
      // we need to set toDate same as the fromDate
      if(interval == 1)
      {
        // set the date data values
        // to convert NgbDate to Date format
        this.standupservice.setDateData(this.fromDate, this.fromDate);
        // set toDate equivalent to fromDate
        this.toDate = this.fromDate;
      }
      // else update only the fromDate
      else{
        // set the date data values
        // to convert NgbDate to Date format
        this.standupservice.setDateData(this.fromDate, this.toDate);
      }

      this.getSearched() 
    }
  }

  FilterByMonth($event, interval){
    if(!this.search.fetching){
      // set initial fromDate to Date Today
      this.fromDate = this.calendar.getToday();

      // get dictionary containing month start date and month end date
      let monthFirstLastDate = GetMonthFirstLastDate(ConvertFromNgbDate(this.fromDate), interval);

      // set fromDate and toDate values based on monthFirstLastDate values
      this.fromDate = new NgbDate(monthFirstLastDate.firstOfMonth.getFullYear(), (monthFirstLastDate.firstOfMonth.getMonth() + 1), monthFirstLastDate.firstOfMonth.getDate());
      this.toDate = new NgbDate(monthFirstLastDate.lastOfMonth.getFullYear(), (monthFirstLastDate.lastOfMonth.getMonth() + 1), monthFirstLastDate.lastOfMonth.getDate());
      
      // set the date data values
      // to convert NgbDate to Date format
      this.standupservice.setDateData(this.fromDate, this.toDate);

      this.getSearched()
    }
  }

  onDateSelection(date: NgbDate) {
    if(!this.search.fetching){
      // happens when both fromDate and toDate is empty
      if (!this.fromDate && !this.toDate) {
        //set fromDate to current date
        this.fromDate = date;
      }
      // check if a fromDate is selected and toDate is still null
      // afterwards check whether fromDate is after selected date or equals to selected date 
      else if (this.fromDate && !this.toDate && (date.after(this.fromDate) || date.equals(this.fromDate))) {
        // set toDate to selected date 
        this.toDate = date;
        // allow user to apply filter
        this.ApplyFilterChange = true;
      } else {
        // if user selects day before from date
        // set toDate to null
        this.toDate = null;
        // set fromDate to selectedDate
        this.fromDate = date;
        // do not allow filter, toDate is empty
        this.ApplyFilterChange = false
      }
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  close($event){
    // close side modal
    setTimeout(()=> { this.feed.showFilter = false }, 50);
  }

  clear($event){
    // revert calendar to its default value
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
    this.standupservice.dateData = DateRange();
    
    // reset search params
    this.search.resetSearch()
    this.search.search(this.state.params.content)
  }

  getSearched(){
    // reset search params
    this.search.resetSearch()
    // send get request and add true to enable date range filtering
    this.search.search(this.state.params.content, true)
  }
}

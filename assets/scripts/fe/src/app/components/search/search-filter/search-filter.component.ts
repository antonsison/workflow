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

// DisableProjCheck:boolean = true;
// DisableStatus:boolean = true;

// checkedAll:boolean = false;

constructor(
  private feed    : FeedService,
  private standupservice : StandupService,
  private calendar       : NgbCalendar,
  private project : ProjectService,
  private search  : SearchService,
  private state   : StateService
) { 
  this.fromDate = calendar.getToday();
}

ngOnInit() {
  this.standupservice.dateData = DateRange();
}

ApplyDateFilter($event){
  this.standupservice.setDateData(this.fromDate, this.toDate)
  this.search.search(this.state.params.content, true)
}

FilterByDays($event, interval){
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

  this.search.search(this.state.params.content, true)
}

FilterByMonth($event, interval){
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

  this.search.search(this.state.params.content, true)
}

onDateSelection(date: NgbDate) {
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

isHovered(date: NgbDate) {
  return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
}

isInside(date: NgbDate) {
  return date.after(this.fromDate) && date.before(this.toDate);
}

isRange(date: NgbDate) {
  return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
}


// selectProject($event, item) {
//   if(this.search.selectedProject.has(item.id)){
//     // if item is exist. Remove it from mapped data
//     this.search.selectedProject.delete(item.id);
//   }
//   else{
//     // else, add the item to mapped data
//     this.search.selectedProject.set(item.id, item)
//   }
//   this.checkedAll = false;
// }

// selectAllProject($event) {
//   this.project.projects.forEach(e => {
//     if(!this.checkedAll){
//       if(!this.search.selectedProject.has(e.id)){
//         // else, add the item to mapped data
//         this.search.selectedProject.set(e.id, e)
//       }
//     }
//     else{
//       // if item is exist. Remove it from mapped data
//       this.search.selectedProject.delete(e.id);
//     }
//   });
//   this.checkedAll = !this.checkedAll
// }

// ProjectCheckboxFilter(){
//   this.DisableProjCheck = !this.DisableProjCheck
// }

// TaskCheckboxFilter(){
//   this.DisableStatus = !this.DisableStatus
// }

close($event){
  setTimeout(()=> { this.feed.showFilter = false }, 50);
}

clear($event){
  this.fromDate = this.calendar.getToday();
  this.toDate = this.calendar.getToday();
  this.standupservice.dateData = DateRange();
  this.search.search(this.state.params.content)
  // this.search.selectedProject.clear();
  // this.checkedAll = false;
  // this.DisableStatus = true;
  // this.DisableProjCheck = true;
  // this.clearTemplate();
}


// testClick($event, test){
//   test.checked = !test.checked
// }

// clearTemplate(){
//   this.search.taskTemplate.forEach(e => {
//     e.checked = false;
//   })
  
//   this.search.projectTemplate.forEach(e => {
//     e.checked = false;
//   })
// }

}

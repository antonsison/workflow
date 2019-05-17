import { Component, OnInit, HostListener } from '@angular/core';
import { StateService, any } from '@uirouter/angular';
import { StandupService } from '../../../commons/services/history/standup.service'
import { NavService } from '../../../commons/services/utils/nav.service';
import { ProjectService } from '../../../commons/services/project/project.service'
import { BreadcrumbsService } from '../../../commons/services/utils/breadcrumbs.service'

import { DateRange, GetPreviousDate, GetMonthFirstLastDate, 
  ConvertFromNgbDate, ConvertToNgbDate, FormatDateToString } from '../../../commons/utils/datetime.utils'

import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

import { ProjectDetail } from '../../../commons/models/project-detail.models';

import { downloadFileHanlder } from '../../../commons/utils/file.utils';


@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  
  // used by bootstrap datetimepicker
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  // boolean to enable disable apply date filter button
  ApplyFilterChange:boolean = false;

  constructor(
    private projectservice : ProjectService,
    private standupservice : StandupService,
    private state          : StateService,
    private nav            : NavService,
    private calendar       : NgbCalendar,
    private crumbs         : BreadcrumbsService
  ) 
  {
    // nav configuration
    // TODO: this sucks!. find a better solution
    this.nav.setNav('Projects/', true, true)
    this.fromDate = calendar.getToday();

  }

  ngOnInit() {
    if ((!this.standupservice.noreload && this.state.$current.name !== 'project-detail-report') || 
      (this.state.$current.name === 'project-detail-report' && this.standupservice.q.length < 1)) 
    {
      // set date range parameters into today
      this.standupservice.dateData = DateRange();
      // clear all fields
      this.standupservice.revertWeeklyReport();
      // get the project detail
      this.projectservice.getProjectDetail(this.state.params.id).subscribe(
        data => {
          // set the project detail data
          this.projectservice.projectDetail = new ProjectDetail(data)
          // set data to be passed for breadcrumbs
          // list of dictionaries containing title and path
          let crumb = [{
            'title': 'Projects',
            'path': 'projects'
          },
          {
            'title': this.projectservice.projectDetail.name,
            'path': 'project-detail'
          }]

          // set bread crumbs
          this.crumbs.setBreadCrumbs(crumb)
        }
      );
      // get all blockers of project
      this.projectservice.getProjectBlockers(this.state.params.id);
      // get all weekly reports
      this.standupservice.getWeeklyReport(this.state.params.id);
    }
    else {
      // enable reload for template data
      this.standupservice.noreload = false;
    }
  }

  updateWeeklyReport(){
    // re-initialize Weekly Report data and query parameters
    this.standupservice.revertWeeklyReport();
    // get weekly report base on new week
    this.standupservice.getWeeklyReport(this.state.params.id);
  }

  previousWeek($event){
    // prevent default action of href to redirect
    $event.preventDefault();
    if(this.standupservice.resultsLoaded){
      // deduct 1 day to week start date to get previous week
      this.standupservice.dateData.dateStart.setDate(this.standupservice.dateData.dateStart.getDate() - 1)
      // apply computations to set new start and end week
      this.standupservice.dateData = DateRange(this.standupservice.dateData.dateStart)

      this.updateWeeklyReport()
    }
  }

  nextWeek($event){
    // prevent default action of href to redirect
    $event.preventDefault()
    if(this.standupservice.resultsLoaded){
      // add 1 day to week end date to get next week
      this.standupservice.dateData.dateEnd.setDate(this.standupservice.dateData.dateEnd.getDate() + 1)
      // apply computations to set new start and end week
      this.standupservice.dateData = DateRange(this.standupservice.dateData.dateEnd)
      this.updateWeeklyReport()
    }
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

  ApplyDateFilter($event){
    if(this.standupservice.resultsLoaded){
      this.standupservice.setDateData(this.fromDate, this.toDate)
      // re-initialize Weekly Report data and query parameters
      this.updateWeeklyReport()
    }
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
    
    // re-initialize Weekly Report data and query parameters
    this.updateWeeklyReport();
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
    // re-initialize Weekly Report data and query parameters
    this.updateWeeklyReport();
  }

  clicked(){ 
    if (this.standupservice.q.length){
      let check:any = []
      this.standupservice.downloadReports(this.state.params.id).subscribe(
        data => {
          downloadFileHanlder(data, 'hello')
        }
      )
    }
  }

  @HostListener('scroll', ['$event']) 
  scrollWeeklyReport(event): void {
    // captures the scroll event on the WeeklyReport-section.
    // it handles the call to the backend when the scroll
    // reach its max height.
    let cHeight = event.target.scrollHeight;
    this.standupservice.scrollHeight = event.target.scrollTop;

    // offset height. this is the sum of the margin/interval
    // of each element inside the `cHeight`. can change based
    // on the design template.
    // margin-height: 581, spacing-height: 100 # spacer so that this
    // sends a call to the backend before the user reach the last item.
    let maxHeight = cHeight - (581 + 100);

    if(this.standupservice.scrollHeight >= maxHeight) {
      // load more weekly report once target height is reached
      this.standupservice.loadMoreWeeklyReport(this.state.params.id)
    }
  }

}

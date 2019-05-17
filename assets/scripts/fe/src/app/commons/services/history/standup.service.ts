import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { urlsafe, queryparams } from '../../utils/http.utils';
import { HISTORY_STANDUP, HISTORY_STANDUP_WEEKLY, HISTORY_PROJECT } from '../../constants/api.constants';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { ConvertFromNgbDate, FormatDateToString } from '../../utils/datetime.utils'
import { downloadFileHanlder } from '../../utils/file.utils';

@Injectable({
  providedIn: 'root'
})
export class StandupService {

  // contains the list of weekly reports
  public q = [];
  // boolean to check if currently getting new weekly report
  public fetching = false;
  // boolean to check if all data are loaded
  public allLoaded = false;
  // boolean to check if api not done loading
  public resultsLoaded = true;
  // url parameter for the next page
  public qparams = {
    page: 1
  };
  // set so that when side panel is called it will not reload all data
  public noreload = false;

  public scrollHeight:number;

  dateData:any = {
    'dateStart':Date.now(),
    'dateEnd':Date.now()
  };

  constructor(
    private http: HttpClient
  ) { }

  getWeeklyReport(id) {
    // toggle fetching to true to prevent multiple
    // similar request to overload the server.
    this.fetching = true;
    this.resultsLoaded = false;
    // set string date format
    let weekStart = FormatDateToString(this.dateData.dateStart)
    let weekEnd = FormatDateToString(this.dateData.dateEnd)
    // add url params
    let url = `${HISTORY_STANDUP_WEEKLY}${queryparams(this.qparams)}&date_start=${weekStart}&date_end=${weekEnd}&project_id=${id}`

    //this.http.get(urlsafe(url, weekStart) + queryparams(this.qparams))
    this.http.get(url)
      .toPromise()
      .then(resp => {
          // append the new data to the current data list.
          this.q = _.concat(this.q, resp['results']);

          // reset the fetching to false.
          this.fetching = false;
          this.resultsLoaded = true;
          // check if this request is the last request. by
          // checking if there is no value for the `next` attribute,
          // we will know that all the data are loaded.
          if(!resp['next']) { this.allLoaded = true; }
      })
    ;
  }

  loadMoreWeeklyReport(id) {
    // check if all the data are loaded.
    if (!this.allLoaded && !this.fetching) {
      // update the page number so that this will fetch
      // the next batch instead of the current one.
      // TODO: Add a checker if the the page_number is more than
      // the maximum page count.
      this.qparams.page++;

      // fetch weekly report items.
      this.getWeeklyReport(id);
    }
  }

  revertWeeklyReport(){
    // remove all saved weekly report
    this.q = []
    // reset page parameter to page 1
    this.qparams.page = 1
    // reset all loaded boolean to allow user to scroll
    this.allLoaded = false
  }

  setDateData(startDate:NgbDate, endDate:NgbDate){
    // set date start and date end
    // convert start and end date from NgbDate into Date format
    this.dateData.dateStart = ConvertFromNgbDate(startDate);
    this.dateData.dateEnd = ConvertFromNgbDate(endDate);
  }

  getReport(id) {
    return this.http.get(urlsafe(HISTORY_STANDUP, id));
  }

  getReportList() {
    return this.http.get(HISTORY_STANDUP);
  }

  downloadReports(id){
    let weekStart = FormatDateToString(this.dateData.dateStart)
    let weekEnd = FormatDateToString(this.dateData.dateEnd)
    // add url params
    let url = `${urlsafe(urlsafe(HISTORY_PROJECT, id), 'report')}${queryparams(this.qparams)}&date_start=${weekStart}&date_end=${weekEnd}`
    
    this.http.get(url, { responseType: 'blob'}).subscribe(
      data => {
        downloadFileHanlder(data, 'hello')
      }
    )
  }
}

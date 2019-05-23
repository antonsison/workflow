import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StandupService } from '../history/standup.service'
import { HISTORY } from '../../../commons/constants/api.constants'
import { urlsafe, queryparams } from '../../utils/http.utils';
import { FormatDateToString } from '../../utils/datetime.utils'
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // boolean for all data loaded and currently fetching data
  public allLoaded:boolean = false;
  public fetching:boolean = false;
  // get the total number of objects
  public result_count:number = 0;
  // get the paginated search result
  public search_result:any = [];
  // binded to searched bar and passed to url
  public searched: string;

  public qparams = {
    page: 1
  };

  constructor(
    private http: HttpClient,
    private standupservice: StandupService
  ) { }


  search(content, dateFilter=false){
    // inititalize url
    let url = "";
    // check if data to be retrieved is not using filter
    if (!dateFilter){
      // set url
      url = `${urlsafe(HISTORY, 'search')}${queryparams(this.qparams)}&content=${content}`
    }
    else{
      // format date start and date end parameters
      let weekStart = FormatDateToString(this.standupservice.dateData.dateStart)
      let weekEnd = FormatDateToString(this.standupservice.dateData.dateEnd)
      // add url params
      url = `${urlsafe(HISTORY, 'search')}${queryparams(this.qparams)}&content=${content}&date_start=${weekStart}&date_end=${weekEnd}`
    }
    // set fetching to true to prevent other get operation
    this.fetching = true;

    this.http.get(url)
    .toPromise()
    .then(resp => {
        // append the new data to the current data list.
        this.search_result = _.concat(this.search_result, resp['results']); 
        this.result_count = resp['count']
        this.fetching = false;
        if(!resp['next']) { this.allLoaded = true; }
    })
  }

  loadMoreSearchedResult(content) {
    // check if all the data are loaded.
    if (!this.allLoaded && !this.fetching) {
      // update the page number so that this will fetch
      // the next batch instead of the current one.
      // TODO: Add a checker if the the page_number is more than
      // the maximum page count.
      this.qparams.page++;

      // fetch weekly report items.
      this.search(content);
    }
  }

  resetSearch(){
    // reset all data and query params to default
    this.search_result = []
    this.allLoaded = false
    this.qparams.page = 1
  }

}

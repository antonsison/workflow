import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StandupService } from '../history/standup.service'
import { HISTORY } from '../../../commons/constants/api.constants'
import { urlsafe } from '../../utils/http.utils';
import { FormatDateToString } from '../../utils/datetime.utils'
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public allLoaded = false;
  public search_result = [];
  public searched: string;

  constructor(
    private http: HttpClient,
    private standupservice: StandupService
  ) { }


  search(content, dateFilter=false){
    let url = "";
    if (!dateFilter){
      url = `${urlsafe(HISTORY, 'search')}?content=${content}`
    }
    else{
      let weekStart = FormatDateToString(this.standupservice.dateData.dateStart)
      let weekEnd = FormatDateToString(this.standupservice.dateData.dateEnd)
      // add url params
      url = `${urlsafe(HISTORY, 'search')}?content=${content}&date_start=${weekStart}&date_end=${weekEnd}`
    }
    
    this.search_result = []
    this.http.get(url)
    .toPromise()
    .then(resp => {
        // append the new data to the current data list.
        this.search_result = _.concat(this.search_result, resp['results']);
        this.allLoaded = true
    })
  }

}

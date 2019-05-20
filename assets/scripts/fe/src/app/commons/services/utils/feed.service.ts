import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { queryparams } from '../../utils/http.utils';

import { Feed } from '../../models/feed.models';
import {
  FEED,
  FEED_NOTIFICATIONS_EVENTS,
  FEED_NOTIFICATIONS_PENDING,
  FEED_CALENDAR_EVENTS,
  FEED_CALENDAR_EVENT
} from '../../constants/api.constants';
import { ServerService } from '../auth/server.service';


@Injectable({
  providedIn: 'root'
})
export class FeedService {
  public showFilter:boolean = false

  public q = [];
  public nEvents: any;
  public pendingIssues: any;

  public scrollHeight:number;

  // toggle checker that is used to check if there is
  // a pending request to the backend. This prevents
  // the system from sending spam requests to the backend.
  public fetching = false;

  // toggle checker that is used to check if the feed list
  // should be reloaded or not. there are pages/components
  // which the list shouldn't be reloaded. (dashboard-report,
  // feed-search, feed-filter).
  public noreload = false;

  // checker that will know if all the data is loaded
  // in the frontend.
  public all_loaded = false;

  // this query params object is used for filtering and searching feature.
  // ADD your filter parameters in here. PAGINATION and QUERIES are
  // always binded to each other. DO NOT SEPARATE this functionalities
  public qparams = {
    page: 1
  };

  constructor(
    private http: HttpClient,
    private server: ServerService
  ) { }

  get yearNow() {
    return String(this.server.now.getFullYear());
  }

  getFeed() {
    // toggle fetching to true to prevent multiple
    // similar request to overload the server.
    this.fetching = true;

    this.http.get(FEED + queryparams(this.qparams))
      .toPromise()
      .then(resp => {
          // append the new data to the current data list.
          this.q = _.concat(this.q, resp['results']);

          // reset the fetching to false.
          this.fetching = false;

          // check if this request is the last request. by
          // checking if there is no value for the `next` attribute,
          // we will know that all the data are loaded.
          if(!resp['next']) { this.all_loaded = true; }
      })
    ;
  }

  loadMoreFeed() {
    // check if all the data are loaded.
    if (!this.all_loaded && !this.fetching) {
      // update the page number so that this will fetch
      // the next batch instead of the current one.
      // TODO: Add a checker if the the page_number is more than
      // the maximum page count.
      this.qparams.page++;

      // fetch feed items.
      this.getFeed();
    }
    else {
      console.log('all data are loaded');
    }
  }

  getNotificationEvents() {
    return this.http.get(FEED_NOTIFICATIONS_EVENTS)
      .toPromise()
      .then(resp => {
        this.nEvents = resp;
      });
  }

  getNotificationPendingIssues() {
    return this.http.get(FEED_NOTIFICATIONS_PENDING)
      .toPromise()
      .then(resp => {
        this.pendingIssues = resp;
      });
  }

  getCalendarEvents(year = this.yearNow) {
    return this.http.get(
      FEED_CALENDAR_EVENTS,
      { params: { year } }
    )
      .toPromise();
  }

  addEvent(value) {
    return this.http.post(FEED_CALENDAR_EVENTS, value)
      .toPromise();
  }

  updateEvent(value, eventID) {
    return this.http.put(FEED_CALENDAR_EVENT(eventID), value)
      .toPromise();
  }

  deleteEvent(value, eventID) {
    return this.http.delete(FEED_CALENDAR_EVENT(eventID), value)
      .toPromise();
  }
}

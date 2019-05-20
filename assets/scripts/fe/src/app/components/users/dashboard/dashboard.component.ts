import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';

import { StateService } from '@uirouter/angular';
import { NavService } from '../../../commons/services/utils/nav.service';
import { FeedService } from '../../../commons/services/utils/feed.service';
import { ServerService } from '../../../commons/services/auth/server.service';

import { ProjectService } from '../../../commons/services/project/project.service'
import { ProjectDetail } from '../../../commons/models/project-detail.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public now = new Date();

  constructor(
    private nav      : NavService,
    private feed     : FeedService,
    private state    : StateService,
    private server   : ServerService,
    private ref      : ChangeDetectorRef,
    private projectservice : ProjectService,
  ) {
    // nav configuration
    // TODO: this sucks!. find a better solution
    this.nav.setNav('Dashboard');
  }

  ngOnInit() {
    // reload the feed item list except on
    // dashboard-report or if the feed list
    // is empty.
    if (!this.feed.noreload && this.state.$current.name !== 'dashboard-report') {
      this.feed.getFeed();
    } else if (this.state.$current.name === 'dashboard-report' && this.feed.q.length < 1) {
      this.feed.getFeed();
    } else {
      this.feed.noreload = false;
    }

    // load the notification events data.
    this.feed.getNotificationEvents();
    // load the notification pending issues data.
    this.feed.getNotificationPendingIssues();
    // load the calendar events data.
    this.feed.getCalendarEvents();

    this.projectservice.getProjects().subscribe(
      data => {
        this.projectservice.projects = data
      }
    )
  }

  @HostListener('scroll', ['$event']) 
  scrollfeed(event): void {
    // captures the scroll event on the feed-section.
    // it handles the call to the backend when the scroll
    // reach its max height.
    let cHeight = event.target.scrollHeight;
    this.feed.scrollHeight = event.target.scrollTop;

    // offset height. this is the sum of the margin/interval
    // of each element inside the `cHeight`. can change based
    // on the design template.
    // margin-height: 708, spacing-height: 100 # spacer so that this
    // sends a call to the backend before the user reach the last item.
    let maxHeight = cHeight - (708 + 100);
    
    if(this.feed.scrollHeight >= maxHeight) {
      this.feed.loadMoreFeed();
    }
  }

}

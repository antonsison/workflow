import { Component, OnInit } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { NavService } from '../../../commons/services/utils/nav.service';
import { BreadcrumbsService } from '../../../commons/services/utils/breadcrumbs.service'

import { FeedService } from '../../../commons/services/utils/feed.service';
import { AuthService } from '../../../commons/services/auth/auth.service';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(
    private bconfig : NgbDropdownConfig,
    private auth    : AuthService,
    private nav     : NavService,
    private crumbs  : BreadcrumbsService,
    private feed    : FeedService,
  ) {
    bconfig.placement = 'bottom-right';
  }

  ngOnInit() {
    this.auth.getuser();
  }

  clicked($event){
    $event.preventDefault();
    this.feed.showFilter = !this.feed.showFilter
    console.log('clicked')
    console.log(this.feed.showFilter)
  }
}

import { Component, OnInit } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { NavService } from '../../../commons/services/utils/nav.service';
import { BreadcrumbsService } from '../../../commons/services/utils/breadcrumbs.service'

import { StateService } from '@uirouter/angular';

import { FeedService } from '../../../commons/services/utils/feed.service';
import { AuthService } from '../../../commons/services/auth/auth.service';
import { SearchService } from '../../../commons/services/utils/search.service'
import { ProjectService } from '../../../commons/services/project/project.service'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(
    private state   : StateService,
    private bconfig : NgbDropdownConfig,
    private auth    : AuthService,
    private nav     : NavService,
    private crumbs  : BreadcrumbsService,
    private feed    : FeedService,
    private project : ProjectService,
    private searchservice  : SearchService
  ) {
    bconfig.placement = 'bottom-right';
  }

  async ngOnInit() {
    this.auth.getuser();
  }

  openFilter($event){
    $event.preventDefault();
    // this.feed.showFilter = !this.feed.showFilter
    setTimeout(()=> { 
      this.feed.showFilter = !this.feed.showFilter;
      // if(this.feed.showFilter && this.project.projects.length == 0){
      //   this.project.getProjects().subscribe(
      //     data => {
      //       this.project.projects = data;
      //     }
      //   )
      // };
    }, 50);
  }

  search($event){
    $event.preventDefault();
    // console.log(this.searchservice.searched)
    // let test = this.searchservice.searched.replace(' ', '-')
    // console.log(test)
    // console.log(this.searchservice.searched)
    console.log(this.searchservice.searched.trim().replace(/\s/g, '-'))
    this.state.go('search', {content:this.searchservice.searched.trim().replace(/\s/g, '-')});
  }
}

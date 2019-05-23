import { Component, OnInit, HostListener } from '@angular/core';
import { StateService } from '@uirouter/angular';

import { FeedService } from '../../../../commons/services/utils/feed.service';

import { StandupService } from '../../../../commons/services/history/standup.service';
import { Standup } from '../../../../commons/models/history.models';
import { SearchService } from '../../../../commons/services/utils/search.service'

@Component({
  selector: 'app-side-report',
  templateUrl: './side-report.component.html',
  styleUrls: ['./side-report.component.css']
})
export class SideReportComponent implements OnInit {
  private open = false;
  private report = new Standup;

  constructor(
    private state   : StateService,
    private feed    : FeedService,
    private history : StandupService,
    private searchservice : SearchService
  ) { }

  ngOnInit() {
    // setTimout is only used for the animation effect.
    // this idea is not the best but it works.
    // IMPORTANT: `this.open` should be set to true otherwise
    // redirecting to this page will not work
    setTimeout(()=> { this.open = true; }, 20);
    
    if(!this.state.params.content)
    {
      if(this.state.params.cardId){
        // enable `StateService.noreload` so that the weekly report list
        // will not reload when this popup is closed.
        this.history.noreload = true;
        this.history.getReport(this.state.params.cardId)
        .subscribe(resp => {
          this.report = new Standup(resp);
        });
      }
      else{
        // enable `FeedService.noreload` so that the feedlist
        // will not reload when this popup is closed.
        this.feed.noreload = true;
        this.history.getReport(this.state.params.id)
        .subscribe(resp => {
          this.report = new Standup(resp);
        });
      }
    }
    else{
      this.searchservice.noReload = true;
      this.state.params.content = this.state.params.content.trim().replace(/\s/g, '-')
      this.history.getReport(this.state.params.cardId)
      .subscribe(resp => {
        this.report = new Standup(resp);
      });
    }
  }

  @HostListener('document:click', ['$event'])
  close(event): void {
    // close the side report detail if the mouse
    // click captured is outside the section.
    let el = event.target,
        container = document.querySelector('.side-modal');
    
    // note: `this.open` serves as an indicator that the click
    // event happens after the page is initialize.
    if (!container.contains(el) && this.open) {
      this.open = false;
      // setTimout is only used for the animation effect.
      // this idea is not the best but it works.
      if(!this.state.params.content)
      {
        if(this.state.params.cardId){
          setTimeout(()=> { this.state.go('project-detail', {id:this.state.params.id}); }, 300);
        }
        else{
          setTimeout(()=> { this.state.go('dashboard'); }, 300);
        }
      }
      else{
        setTimeout(()=> { this.state.go('search', {content:this.state.params.content}); }, 300);
      }
    }
  }

}

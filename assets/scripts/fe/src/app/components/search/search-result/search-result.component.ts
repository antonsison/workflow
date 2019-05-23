import { Component, OnInit, HostListener } from '@angular/core';
import { NavService } from '../../../commons/services/utils/nav.service';
import { SearchService } from '../../../commons/services/utils/search.service'
import { StateService } from '@uirouter/angular';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  orderByFilter:string = "Newest";

  constructor(
    private nav     : NavService,
    private searchservice : SearchService,
    private state   :StateService
  ) {
    this.nav.setNav('', true)
   }

  ngOnInit() {
    // remove spacing characters from url
    this.state.params.content = this.state.params.content.trim().replace(/-/g, ' ')
    // get searched data
    this.searchservice.search(this.state.params.content)
  }

  orderBy($event, orderByFilter) {
    // set filter value
     this.orderByFilter = orderByFilter

    // if(orderByFilter == "Newest"){
    //   // order array based on date created ascending
    //   this.sortObjectbyDate(this.searchservice.search_result)
    // }
    // else{
    //   // order array based on date created descending
    //   this.reverseSortObjectbyDate(this.searchservice.search_result)
    // }
    this.order()
  }

  order(){
    if(this.orderByFilter == "Newest"){
      // order array based on date created ascending
      this.sortObjectbyDate(this.searchservice.search_result)
    }
    else{
      // order array based on date created descending
      this.reverseSortObjectbyDate(this.searchservice.search_result)
    }
  }

  sortObjectbyDate(object) {
    //bubble sort for ascending order date comparison
    let n = object.length;
    for (let i = 0; i < n-1; i++){
      for (let j = 0; j < n-i-1; j++)
      {
        if (object[j].instance.date_created < object[j+1].instance.date_created) 
        { 
            let temp = object[j]; 
            object[j] = object[j+1]; 
            object[j+1] = temp; 
        } 
      }
    }
  }
  reverseSortObjectbyDate(object) {
    //bubble sort for descending order date comparison
    let n = object.length;
    for (let i = 0; i < n-1; i++){
      for (let j = 0; j < n-i-1; j++)
      {
        if (object[j].instance.date_created > object[j+1].instance.date_created) 
        { 
            let temp = object[j]; 
            object[j] = object[j+1]; 
            object[j+1] = temp; 
        } 
      }
    }
  }

  @HostListener('scroll', ['$event']) 
  scrollWeeklyReport(event): void {
    // captures the scroll event on the WeeklyReport-section.
    // it handles the call to the backend when the scroll
    // reach its max height.
    let cHeight = event.target.scrollHeight;
    let scrollheight = event.target.scrollTop;

    // offset height. this is the sum of the margin/interval
    // of each element inside the `cHeight`. can change based
    // on the design template.
    // margin-height: 581, spacing-height: 100 # spacer so that this
    // sends a call to the backend before the user reach the last item.
    let maxHeight = cHeight - (1108 + 100);

    //if(this.searchservice.scrollHeight >= maxHeight) {
    if(scrollheight >= maxHeight) {
      // load more searched result once target height is reached
      this.searchservice.loadMoreSearchedResult(this.state.params.content)
      this.order()
    }
  }
}

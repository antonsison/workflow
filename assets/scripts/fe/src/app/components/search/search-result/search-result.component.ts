import { Component, OnInit } from '@angular/core';
import { NavService } from '../../../commons/services/utils/nav.service';
import { SearchService } from '../../../commons/services/utils/search.service'
import { StateService } from '@uirouter/angular';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  title = "Newest";

  constructor(
    private nav     : NavService,
    private searchservice : SearchService,
    private state   :StateService
  ) {
    this.nav.setNav('', true)
   }

  ngOnInit() {
    this.state.params.content = this.state.params.content.trim().replace(/-/g, ' ')
    this.searchservice.search(this.state.params.content)
  }

  testing($event, title) {
    this.title = title

    if(title == "Newest"){
      this.sortObjectbyDate(this.searchservice.search_result)
    }
    else{
      this.reverseSortObjectbyDate(this.searchservice.search_result)
    }
  }

  sortObjectbyDate(object) {
    let n = object.length;
    for (let i = 0; i < n-1; i++){
      for (let j = 0; j < n-i-1; j++)
      {
        if (object[j].instance.date_created < object[j+1].instance.date_created) 
        { 
            // swap arr[j+1] and arr[i] 
            let temp = object[j]; 
            object[j] = object[j+1]; 
            object[j+1] = temp; 
        } 
      }
    }
  }
  reverseSortObjectbyDate(object) {
    let n = object.length;
    for (let i = 0; i < n-1; i++){
      for (let j = 0; j < n-i-1; j++)
      {
        if (object[j].instance.date_created > object[j+1].instance.date_created) 
        { 
            // swap arr[j+1] and arr[i] 
            let temp = object[j]; 
            object[j] = object[j+1]; 
            object[j+1] = temp; 
        } 
      }
    }
  }
}

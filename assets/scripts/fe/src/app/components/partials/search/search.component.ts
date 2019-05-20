import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../../commons/services/utils/feed.service'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  private open = false;

  constructor(
    private feed    : FeedService,
  ) { }

  ngOnInit() {
  }

}

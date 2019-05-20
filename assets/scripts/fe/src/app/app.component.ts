import { Component, OnInit } from '@angular/core';
import { NavService } from './commons/services/utils/nav.service';
import { ServerService } from './commons/services/auth/server.service';
import { UsersService } from './commons/services/users/users.service';
import { User } from './commons/models/user.models';
import { FeedService } from './commons/services/utils/feed.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  constructor(
    private nav    : NavService,
    private server : ServerService,
    private usersService: UsersService,
    private feed    : FeedService,
  ) {
    // load server date time
    server.syncServerDT();

    // fetch all users and store to `UsersService.allUSers`
    usersService.fetchUsers()
      .then((data: Array<User>) => {
        this.usersService.allUsers = data;
      });
  }
}

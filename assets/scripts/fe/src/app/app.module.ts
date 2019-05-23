import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { UIRouterModule } from '@uirouter/angular';
import { CookieService } from 'ngx-cookie-service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PartialsModule } from './components/partials/partials.module';
import { PublicModule } from './components/public/public.module';
import { UsersModule } from './components/users/users.module';
import { ProjectsModule } from './components/projects/projects.module';
import { PayrollModule } from './components/payroll/payroll.module';
import { SearchModule } from './components/search/search.module'

import { TokenService } from './commons/services/interceptors/token.service';
import { APP_STATES } from './commons/utils/app.states';
import { AppComponent } from './app.component';

import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    UIRouterModule.forRoot(APP_STATES),
    NgbModule.forRoot(),
    
    PartialsModule,
    PublicModule,
    UsersModule,
    ProjectsModule,
    PayrollModule,
    SearchModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenService, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../commons/pipes/pipes.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UIRouterModule } from '@uirouter/angular';
import { DirectivesModule } from '../../commons/directives/directives.module';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { SearchResultComponent } from './search-result/search-result.component'

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    UIRouterModule,
    DirectivesModule,
    FormsModule,
    PipesModule
  ],
  exports: [SearchFilterComponent],
  declarations: [SearchFilterComponent, SearchResultComponent]
})
export class SearchModule { }

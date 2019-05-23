import { ContentOnly, NavContent, NavSideOpenContent } from '../../commons/utils/layout.utils';
import { LoginRequired } from '../../commons/utils/security.utils';

import { SearchResultComponent } from './search-result/search-result.component'
import { SideReportComponent } from '../users/dashboard/side-report/side-report.component';

export const SEARCH_STATES : Object[] = [
  {
    name    : 'search',
    url     : '/search?:content',
    views   : NavContent(SearchResultComponent),
    onEnter : LoginRequired
  },
  {
    name    : 'search-report',
    url     : '/search/:content/project/:id/report/card/:cardId',
    views   : NavSideOpenContent(SideReportComponent, SearchResultComponent),
    onEnter : LoginRequired
  },
]
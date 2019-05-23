import { ContentOnly, NavContent, NavSideOpenContent } from '../../commons/utils/layout.utils';
import { LoginRequired } from '../../commons/utils/security.utils';

import { SearchResultComponent } from './search-result/search-result.component'

export const SEARCH_STATES : Object[] = [
  {
    name    : 'search',
    url     : '/search?:content',
    views   : NavContent(SearchResultComponent),
    onEnter : LoginRequired
  },
]
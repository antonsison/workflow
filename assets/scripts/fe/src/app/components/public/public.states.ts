import { StateService } from '@uirouter/angular';
import { ContentOnly } from '../../commons/utils/layout.utils';
import { Disconnect, SlackAuthRedirect, LoggedInUser } from '../../commons/utils/security.utils';

import { LoginComponent } from './login/login.component';


export const PUBLIC_STATES : Object[] = [
    {
      name  : 'login',
      url   : '/login/',
      views : ContentOnly(LoginComponent),
      params: {next: window.location.pathname}
    },
    {
      name    : 'logout',
      url     : '/logout/',
      onEnter : Disconnect
    },
    {
      name    : 'slackauthredirect',
      url     : '/auth/slack/redirect/:token/',
      onEnter : SlackAuthRedirect
    },
    {
      name    : 'domain',
      url     : '/',
      onEnter : LoggedInUser
    }
]
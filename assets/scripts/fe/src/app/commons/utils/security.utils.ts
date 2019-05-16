import * as _ from 'lodash';

import { AuthService } from '../services/auth/auth.service';
import { SlackService } from '../services/auth/slack.service';
import { PayrollService } from '../services/payroll/payroll.service';


/* LOGIN REQUIRED
 * @desc : callback function that will check and will not pass
 *         users that are not logged in.
 */
export function LoginRequired(t) {
  let auth = t.injector().get(AuthService),
      state = t.router.stateService;

  if(!auth.authenticated()) return state.target('login');
}


/* DISCONNECT
 * @desc : callback function that will log user out.
 *         (removes/clear the user token)
 */
export function Disconnect(t) {
  let auth = t.injector().get(AuthService),
      state = t.router.stateService;

  if(auth.authenticated()) auth.rmToken();
  return state.target('login', {next: '/dashboard/'});
}


/* PAYROLL REDIRECT
 */
export async function PayrollRedirect(t) {
  let auth = t.injector().get(AuthService),
      payroll = t.injector().get(PayrollService),
      state = t.router.stateService;

  if(!auth.authenticated()) return state.target('login');

  // check if `payroll.plist` is not empty, redirect
  // the user to the first instance. If empty, get the
  // list from the backend and redirect to the first
  // instance.
  if(_.isEmpty(payroll.plist)) {
    // TODO: improve this part. it looks good but messy.
    // `payroll.plist` shouldn't be assigned in this function
    await payroll.list()
      .toPromise()
      .then(resp=>{ payroll.plist = resp; return resp; });
  }

  if(payroll.plist.length !== 0) {
    return state.target('payroll-detail', {id: payroll.plist[0].id});
  }
}


/* SLACK LOGIN REDIRECT
 * @desc : callback receiver for requests coming from
 *         slack server.
 */
export async function SlackAuthRedirect(t, $state) {
  let auth = t.injector().get(AuthService),
      slack = t.injector().get(SlackService),
      state = t.router.stateService,
      token = t._targetState._params.token;

  if (token) {
    // validate if the access token is valid. retrieve
    // the user token from the backend and redirect
    // the user to the dashboard.
    await slack.getUserToken(token);
    // token is invalid or other error.
    //if(!auth.authenticated()) return state.target('login');

    return state.target('dashboard');
  }

  return state.target('login');
}


export function LoggedInUser(t) {
  let auth = t.injector().get(AuthService),
      state = t.router.stateService;

  if(auth.authenticated()) return state.target('dashboard');
  else return state.target('login');
}

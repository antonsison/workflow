import { Plan, Deduction } from './payroll.models';

/* Model class for user
 */
export class User {
  id            : string = null;
  email         : string = null;
  first_name    : string = null;
  last_name     : string = null;
  full_name     : string = null;
  has_usable_pass : boolean = null;
  birthdate     : string = null;
  image         : string = null;
  position      : string = null;
  position_type : string = null;
  date_started  : string = null;
  deductions    : Deduction[] = new Array<Deduction>();
  plans         : Plan[] = new Array<Plan>();

  constructor(data={}) {
    Object.assign(this, data);
  }
}

export class ShortUser {
  birthdate   : string = null;
  email       : string = null;
  first_name  : string = null;
  full_name   : string = null;
  id          : string = null;
  image       : string = null;
  last_name   : string = null;
}
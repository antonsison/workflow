import { ShortUser } from "./user.models";

export class Feed {
  instance : Object = {};
  instance_type : string = null;

  constructor(data={}) {
    Object.assign(this, data);
  }
}

export class Event {
  title                     : string = null;
  content                   : string = null;
  event_date                : string = null;
  start_time                : string = null;
  end_time                  : string = null;
  frequency                 : string = null;
  participants_id           : Array<string> = null;
  readonly id               : string = null;
  readonly participants     : Array<ShortUser> = null;
  readonly organizer        : any    = null;
  readonly freq_day         : string = null;
  readonly freq_hr          : string = null;
  readonly freq_min         : string = null;
  readonly freq_mo          : string = null;
  readonly freq_week_idx    : string = null;
  readonly date_created     : string = null;


  constructor(data = {}) {
    Object.assign(this, data);
  }
}

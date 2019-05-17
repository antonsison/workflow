import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';

export class EventForm {
  public form: FormGroup;
  public submitted: Boolean = false;

  constructor (data) {
    /* Initialize the form builder
     */
    this.form = new FormBuilder().group({
      title             : new FormControl(data.title, [Validators.required]),
      content           : new FormControl(data.content, [Validators.required]),
      participants_id   : new FormControl(data.participants_id, [Validators.required]),
      event_date        : new FormControl(data.event_date, [Validators.required]),
      start_time        : new FormControl(data.start_time, [Validators.required]),
      end_time          : new FormControl(data.end_time, [Validators.required]),
      frequency         : new FormControl(data.frequency),
    });
  }

  /* Check if form field is valid
   */
  valid (f) {
    return !(!this.form.get(f).valid && (this.form.get(f).touched || this.submitted));
  }

  /* Check if the form field has an error
   */
  hasError (f, e) {
    return this.form.get(f).hasError(e) && (this.form.get(f).touched || this.submitted);
  }

  /* DEFAULT VALUE
   * set the value of the form fields if there is a default value.
   */
  defaultValue (d) {
    let frequency: string;

    // If frequency is not undefiend or empty
    // transform it into an english translation
    if (d.frequency !== undefined && d.frequency !== '') {
      const { freq_day, freq_mo, freq_week_idx } = d;

      if (isNaN(freq_day) && isNaN(freq_mo) && isNaN(freq_week_idx)) { // Daily
        frequency = 'daily';
      } else if (isNaN(freq_day) && isNaN(freq_mo) && !isNaN(freq_week_idx)) { // Weekly
        frequency = 'weekly';
      } else if (!isNaN(freq_day) && isNaN(freq_mo) && isNaN(freq_week_idx)) { // Monthly
        frequency = 'monthly';
      } else if (!isNaN(freq_day) && !isNaN(freq_mo) && isNaN(freq_week_idx)) { // Yearly
        frequency = 'yearly';
      }
    } else {
      frequency = 'none';
    }

    this.form.patchValue({ ...d, frequency });
  }

  getValue() {
    const controls    = this.form.controls;
    const startTimeFC = controls['start_time'];
    const eventDateFC = controls['event_date'];

    const date        = moment(
      `${eventDateFC.value} ${startTimeFC.value}`
      , 'YYYY-MM-DD hh:mm:ss')
      .toDate();

    const freqMin     = date.getMinutes();
    const freqHr      = date.getHours();
    const freqDay     = date.getDate();
    const freqMonth   = date.getMonth() + 1;
    const freqWeekIdx = date.getDay();

    let frequency;

    // Transform frequency value into a cron expression
    switch (this.form.value.frequency) {
      case 'daily':
        frequency = `${freqMin} ${freqHr} * * *`;
        break;
      case 'weekly':
        frequency = `${freqMin} ${freqHr} * * ${freqWeekIdx}`;
        break;
      case 'monthly':
        frequency = `${freqMin} ${freqHr} ${freqDay} * *`;
        break;
      case 'yearly':
        frequency = `${freqMin} ${freqHr} ${freqDay} ${freqMonth} *`;
        break;
      default:
        frequency = '';
        break;
    }

    return { ...this.form.value, frequency };
  }

}

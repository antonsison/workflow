import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';


export class UserForm {
  public form: FormGroup;
  public submitted: Boolean = false;

  constructor (data) {
    /* Initialize the form builder
     */
    this.form = new FormBuilder().group({
      email        : new FormControl(data.email, [Validators.required, Validators.email]),
      first_name   : new FormControl(data.first_name, [Validators.required]),
      last_name    : new FormControl(data.last_name, [Validators.required]),
      birthdate    : new FormControl(data.birthdate, [Validators.required]),
      position     : new FormControl(data.position, [Validators.required]),
      position_type: new FormControl(data.position_type, [Validators.required]),
      date_started : new FormControl(data.date_started, [Validators.required]),
    })
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
    // set a timeout just incase that the value is not yet ready.
    this.form.patchValue(d);
  }

}
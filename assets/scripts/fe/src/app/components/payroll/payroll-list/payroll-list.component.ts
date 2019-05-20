import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/angular';

import { PayrollService } from '../../../commons/services/payroll/payroll.service';
import { AuthService } from '../../../commons/services/auth/auth.service';
import { Payroll } from '../../../commons/models/payroll.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css']
})
export class PayrollListComponent implements OnInit {
  
  private payroll = new Payroll;
  private sending: Boolean = false;

  constructor(
    private state          : StateService,
    private auth           : AuthService,
    private payrollservice : PayrollService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    // get the list of payrolls for the
    // authenticated user.
    if(!_.size(this.payrollservice.plist)) {
      this.payrollservice.getList();
    }
  }

  onToggle($event, item){
    // Function trigger upon checkbox toggle
    $event.stopPropagation()
    // Checks if item is already exist in selectedPayroll 
    if(this.payrollservice.selectedPayroll.has(item.id)){
      // if item is exist. Remove it from mapped data
      this.payrollservice.selectedPayroll.delete(item.id);
    }
    else{
      // else, add the item to mapped data
      this.payrollservice.selectedPayroll.set(item.id, item)
    }
  }

  downloadPDF(){
    // loops over each item of the mapped data
    this.payrollservice.selectedPayroll.forEach((value: Payroll, key: string) => {
      // get file name
      const file_name = this.getFileName(value);
      // call the download functionality with parameters of item id and file name
      this.payrollservice.downloadPDF(key, file_name);
    });
  }

  getFileName(payrollValue){
    // Constructing the file name for the pdf
    const employeeName = `p${payrollValue.user.id}_${payrollValue.user.last_name}`;
    const datePhrase = this.datePipe.transform(`${payrollValue.date_from}`, "MM-dd-yy");

    return `${employeeName}_${datePhrase}`;;
  }

  sendPDF(){
    // prevent user from doing multiple action
    // while sending file is not finished
    if (this.sending != true){
      // get the selected ids
      let selectedPayrollId = Array.from( this.payrollservice.selectedPayroll.keys() );
      // bind sending to true to prevent other action while sending
      this.sending = true;
      if (selectedPayrollId.length){
        this.payrollservice.sendPayrollReport(selectedPayrollId)
        // upon finish execution bind sendint to false so user can
        // use sendPDF and downloadPDF
        .then(resp => { 
          this.sending = false;
          selectedPayrollId.forEach (id => {
            const data = {'is_sent': true, 'date_sent': new Date}
            this.payrollservice.put(id, data).subscribe()
            this.payrollservice.list().subscribe(
              data => {
                this.payrollservice.plist = data
              }
            )
          })
        }) .catch(err => { this.sending = false; console.log(err) });
      }
    }
  }
}

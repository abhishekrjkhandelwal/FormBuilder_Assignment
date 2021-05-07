import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl, AbstractControl, FormBuilder } from '@angular/forms';
import { FormBuilderService } from '../Services/form-builder.service';
import { DatePipe } from '@angular/common';


@Component ({
    selector: 'formBuilderDialogPage',
    templateUrl: './formBuilderDialogBox.component.html',
    styleUrls: ['./formBuilderDialogBox.component.css'],
    providers: [ DatePipe ]
})


export class formBuilderDialogPage implements OnInit {

      birthDate: any;
      formBuilderForm!: FormGroup;
      keyUser!: any;
      submitted = false;
      formData: any = [];
      countries: string[] = ['USA', 'UK', 'Canada', 'India'];
      default = 'UK';
      userName!: string;
      mobileNumber = /[0-9\+\-\ ]/;
      emailPattern = "[a-zA-Z0-9_.+-,;]+@(?:(?:[a-zA-Z0-9-]+\.,;)?[a-zA-Z]+\.,;)?(gmail)\.com";
      adhhaarNumber = /^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$/;
      myDate: any = new Date();
      address!: string;
      adhaarNumber!: string;
      country!: string;
      email!: string;
      mobileno!: string;
      name!: string;
      gender!: string;
      toggleOption: any;
      
      public name_is_active: any;
      email_is_active = false;
      gender_is_active = false;
      birthDate_is_active = false;
      adhaarNumber_is_active = false;
      mobileno_is_active = false;
      address_is_active = false;
      country_is_active = false;
      resultArray = [];

      ngOnInit(): void {
        console.log('Status', this.name_is_active);
        this.birthDate = new Date();        
        this.formBuilderForm = this.formBuilder.group({
         name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(1), Validators.pattern(/^\S+[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)]],
         email: ['', Validators.compose([
           Validators.required, this.commaSepEmail
         ]) ],
         gender: ['male', [Validators.required]],
         birthDate: [' ', [Validators.required]],
         adhaarNumber: ['', [Validators.required, Validators.pattern(this.adhhaarNumber)]],
         mobileno: ['', [Validators.required, Validators.pattern(this.mobileNumber)]],
         address: ['', [Validators.required, Validators.pattern(this.address)]],
         country: ['', [Validators.required]],
        });
        
        this.keyUser = this.formBuilderService.getAdhaarNumber();
        this.getData(); 
      }

    

      ngDoCheck() {
        this.toggleOption = [
          { name: `${this.name_is_active}`},
          { email: `${this.email_is_active}` },
          { gender: `${this.gender_is_active}`},
          { birthDate: `${this.birthDate_is_active}` },
          { adhaarNumber: `${this.adhaarNumber_is_active}`},
          { mobileno: `${this.mobileno_is_active}` },
          { address : `${this.address_is_active}`},
          { country: `${this.country_is_active}` },
        ]    
      }

      commaSepEmail = (control: AbstractControl): { [key: string]: String } | any => {
        console.log('control', control.value);
        if (control.value){
            var emails= control.value.split(', ');
            const forbidden = emails.some((email:any) => Validators.email(new FormControl(email)));
            console.log(forbidden);
            return forbidden ? { 'email': { value: control.value.trim() } } : null;
        }
      };
      
     constructor(
          private formBuilder: FormBuilder,
          private dialogRef: MatDialogRef<formBuilderDialogPage>,
          private formBuilderService: FormBuilderService,
          private datePipe:  DatePipe,
        ) {
          this.myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
         }

        onCloseDialog(): void {
                this.dialogRef.close();
            }

        updateFormBuilderByName(): void {
                    const keyValues: any = [];
                    let key: any;
                    for(key of Object.values(this.toggleOption)) {
                      const keys: any = Object.values(key);
                      if(keys == "false") {
                           keyValues.push(Object.keys(key)) 
                      }
                    }
                    
                    for(var arr of keyValues) {
                        delete this.formBuilderForm.value[`${arr}`];
                    }                   
                    console.log(this.formBuilderForm.value);
                    this.formBuilderForm.value.createdAt = this.myDate;
                    this.formBuilderService.updateFormBuilderServiceByName(this.keyUser, this.formBuilderForm.value).subscribe(data => {
                       this.getData();
                  });
              }

        getData(): void {
                    const adhaarNumber = this.formBuilderService.getAdhaarNumber();

                    console.log("AdhaarNumber", adhaarNumber);

                    this.formBuilderService.getFormData().subscribe(data => {
                    console.log('data', data.formdata[0]);
                    
                   for(let row in data.formdata)
                      if(adhaarNumber == data.formdata[row].adhaarNumber) {
                      this.name = data.formdata[row].name,
                      console.log('name------->', this.name);
                      this.email = data.formdata[row].email,
                      this.gender = data.formdata[row].gender,
                      this.adhaarNumber = data.formdata[row].adhaarNumber;
                      console.log('name------->', this.adhaarNumber);
                      this.country = data.formdata[row].country,
                      this.mobileNumber = data.formdata[row].mobileNumber,
                      this.birthDate = data.formdata[row].birthDate,
                      this.address = data.formdata[row].address,
                      this.mobileno = data.formdata[row].mobileno
                    }
                });
        }
}
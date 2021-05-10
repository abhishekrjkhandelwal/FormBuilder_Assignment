import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl, AbstractControl, FormBuilder } from '@angular/forms';
import { FormBuilderService } from '../Services/form-builder.service';
import { DatePipe } from '@angular/common';
import { SnackbarService } from '../Services/snackbar.service';
import { indicate } from '../operator'
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';


@Component ({
    selector: 'formBuilderDialogPage',
    templateUrl: './formBuilderDialogBox.component.html',
    styleUrls: ['./formBuilderDialogBox.component.css'],
    providers: [ DatePipe ]
})


export class formBuilderDialogPage implements OnInit {

      @Output() updateData: any = new EventEmitter<any>();

      birthDate: any;
      formBuilderForm!: FormGroup;
      adhaarNumber!: any;
      submitted = false;
      formData: any = [];
      countries: string[] = ['USA', 'UK', 'Canada', 'India'];
      default = 'UK';
      userName!: any;
      mobileNumber = /[0-9\+\-\ ]/;
      emailPattern = "[a-zA-Z0-9_.+-,;]+@(?:(?:[a-zA-Z0-9-]+\.,;)?[a-zA-Z]+\.,;)?(gmail)\.com";
      adhhaarNumber = /^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$/;
      myDate: any = new Date();
      address!: string;
      country!: string;
      email!: string;
      eMail!: string;
      mobileno!: string;
      name!: string;
      gender!: string;
      toggleOption: any;
      loading$ = new Subject<boolean>();
      totalPosts = 10;
      postsPerPage = 2;
      pageSizeOptions = [1, 2, 3, 4, 5, 6];
      currentPage = 1;

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
        this.formBuilderForm.controls.country.setValue(this.default, {onlySelf: true});        
        this.adhaarNumber = this.formBuilderService.getData().adhaarNumber;
        this.eMail = this.formBuilderService.getData().email;
        this.getData();
      }

      onChangedPage(pageData: PageEvent) {
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
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
          private snakbarService: SnackbarService,
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
                        if(arr == "name")  this.formBuilderForm.value[`${arr}`] = this.name;
                        else if(arr == "email") this.formBuilderForm.value[`${arr}`] = this.email;                        
                        else if(arr == "gender") this.formBuilderForm.value[`${arr}`] = this.gender;                        
                        else if(arr == "adhaarNumber") this.formBuilderForm.value[`${arr}`] = this.adhaarNumber;                        
                        else if(arr == "address") this.formBuilderForm.value[`${arr}`] = this.address;                        
                        else if(arr == "mobileno") this.formBuilderForm.value[`${arr}`] = this.mobileno;                        
                        else if(arr == "birthDate") this.formBuilderForm.value[`${arr}`] = this.name;                        
                        else if(arr == "country") this.formBuilderForm.value[`${arr}`] = this.country;   
                    }                   
                    console.log(this.formBuilderForm.value);
                    this.formBuilderForm.value.createdAt = this.myDate;
                    try {
                      this.formBuilderService.updateFormBuilderServiceByName(this.eMail, this.adhaarNumber, this.formBuilderForm.value).pipe(indicate(this.loading$)).subscribe(data => {  
                        console.log("data", data);
                        this.snakbarService.openSnackBar("User Details updated");
                    });
                    } catch(e) {
                       this.snakbarService.openSnackBar("unable to update data");
                    }
              }

        getData(): void {
                    try {
                    this.formBuilderService.getFormData(this.postsPerPage, this.currentPage).pipe(indicate(this.loading$)).subscribe(data => {
                      console.log("formdata", data.formdata);
                    for(let row in data.formdata) {
                      if(this.adhaarNumber == data.formdata[row].creators[row].adhaarNumber) {
                      this.name = data.formdata[row].name,
                      this.email = data.formdata[row].email,
                      this.adhaarNumber = data.formdata[row].creators[row].adhaarNumber;
                      this.country = data.formdata[row].creators[row].country,
                      this.mobileNumber = data.formdata[row].creators[row].mobileNumber,
                      this.birthDate = data.formdata[row].creators[row].birthDate,
                      this.address = data.formdata[row].creators[row].address,
                      this.mobileno = data.formdata[row].creators[row].mobileno;
                      this.gender = data.formdata[row].gender;
                      }
                    }
                    this.snakbarService.openSnackBar("Fetch User Details")
                });
              } catch(e) {
                this.snakbarService.openSnackBar("unable to fetch user Details");
              }
        }
}
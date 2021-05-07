import { Component, OnInit, SimpleChange } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormBuilderService } from '../Services/form-builder.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { formBuilderDialogPage } from './formBuilderDialogBox.component';
import { mimeType } from './mime-type.validator';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
  providers: [ DatePipe ]
})

export class FormBuilderComponent implements OnInit {

  birthDate: any;
  adhaarNumber : String[] = [];
  emailList: string[] = [];
  formBuilderForm!: FormGroup;
  submitted = false;
  formData: any = [];
  countries: string[] = ['USA', 'UK', 'Canada', 'India'];
  default = 'UK';
  userName!: string;
  imagePreview!: any;
  myDate: any = new Date();
  emailPattern = "[a-zA-Z0-9_.+-,;]+@(?:(?:[a-zA-Z0-9-]+\.,;)?[a-zA-Z]+\.,;)?(gmail)\.com";
  adhhaarNumber = /^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$/;
  mobileNumber = /[0-9\+\-\ ]/;
  address = /^[#.0-9a-zA-Z\s,-]+$/;
  newDynamic: any =  {};
  dynamicArray: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private formBuilderService: FormBuilderService,
    private dialog: MatDialog,
    private datePipe:  DatePipe,
    private router: Router,
  ) { 
    this.myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.getData();
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
      image: [null,
        {
          validators:  [Validators.required],
          asyncValidators: [mimeType]
        }],
        createdAt: ['', [Validators.required]]
    });
    this.formBuilderForm.controls.country.setValue(this.default, {onlySelf: true});
  }

  commaSepEmail = (control: AbstractControl): { [key: string]: String } | any => {
    if (control.value) {
        var emails= control.value.split(', ');
        const forbidden = emails.some((email:any) => Validators.email(new FormControl(email)));
        console.log(forbidden);
        return forbidden ? { 'email': { value: control.value.trim() } } : null;
    }
  };

    postFormData() {
        let adhaarNumber = this.formBuilderForm.value.adhaarNumber;
        this.formBuilderForm.value.createdAt = this.myDate;
      
        if(!this.adhaarNumber.includes(adhaarNumber)) {
              this.formBuilderService.postFormData(this.formBuilderForm.value, this.formBuilderForm.value.image).subscribe( data => {
              if(data) {
                 this.getData();
              }
        });
       } else {
         console.log("adhaarNumber is already registered please try another");
       }
  } 

  async getData() {
       await this.formBuilderService.getFormData().subscribe(data => {
        this.formData = data.formdata;
        console.log('fromdata', this.formData);
        this.newDynamic = {name: this.formData.name , email: this.formData.email, gender: this.formData.gender, adhaarNumber: this.formData.adhaarNumber, addess: this.formData.address, mobileno: this.formData.mobileno, birthDate: this.formData.birthDate, country: this.formData.country};
        this.dynamicArray.push(this.newDynamic);
        for (var adhaarNumber of data.formdata) {
           this.adhaarNumber.push(adhaarNumber.adhaarNumber);    
        }
     });
  }


  onImagePicked(event: any) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    console.log(typeof file);
    console.log(file);
    this.formBuilderForm.patchValue({image: file});
    this.formBuilderForm.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
  }

   openformBuilderDialog(event: Event, email: string, keyUser: number): void {
    this.formBuilderService.setData(email, keyUser);
    let dialogRef = this.dialog.open(formBuilderDialogPage, {
        minWidth: '400px',
        minHeight: '620px'
     });
     dialogRef.afterClosed().subscribe();
   }

   deleteFormDataByName(event: Event, keyUser: string, keyMobileNo: number ,index: number) {
      this.formBuilderService.deleteFormDataByName(keyUser, keyMobileNo).subscribe(data => {
        this.formData.splice(index, 1);
      });
   }
}
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormBuilderService } from '../Services/form-builder.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { formBuilderDialogPage } from './formBuilderDialogBox.component';
import { mimeType } from './mime-type.validator';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SnackbarService } from '../Services/snackbar.service';
import { indicate } from '../operator'
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
  providers: [ DatePipe ]
})


export class FormBuilderComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  progress: number = 0;
  updateData: any;
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
  loading$ = new Subject<boolean>();
  FILE: any;

  //validate patterns
  emailPattern = "[a-zA-Z0-9_.+-,;]+@(?:(?:[a-zA-Z0-9-]+\.,;)?[a-zA-Z]+\.,;)?(gmail)\.com";
  adhhaarNumber = /^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$/;
  mobileNumber = /[0-9\+\-\ ]/;
  address = /^[#.0-9a-zA-Z\s,-]+$/;
  
  
  //pagination
  totalPosts = 20;
  postsPerPage = 3;
  pageSizeOptions = [1, 2, 3, 4, 5, 6];
  currentPage = 1;

  constructor(
    private formBuilder: FormBuilder,
    private formBuilderService: FormBuilderService,
    private dialog: MatDialog,
    private datePipe:  DatePipe,
    private router: Router,
    private snackbarService: SnackbarService,
  ) { 
    this.myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.getData();
    this.formBuilderService.getFormData(this.postsPerPage, this.currentPage);
    this.birthDate = new Date();
    this.formBuilderForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(1), Validators.pattern(/^\S+[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/)]],
      email: ['', Validators.compose([Validators.required, this.commaSepEmail]) ],
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

  ngAfterContentChecked() {
    this.updateData = this.formBuilderService.getUpdateData();
    if(this.updateData) {
      this.formData = this.updateData.formdata;
    }
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.getData();
  }

  commaSepEmail = (control: AbstractControl): { [key: string]: String } | any => {
    if (control.value) {
        var emails= control.value.split(', ');
        const forbidden = emails.some((email:any) => Validators.email(new FormControl(email)));
        console.log(forbidden);
        return forbidden ? { 'email': { value: control.value.trim() } } : null;
    }
  };

  // onImagePicked(event: any) {
  //   const file = (event.target as HTMLInputElement).files?.item(0);
  //   console.log(typeof file);
  //   console.log(file);
  //   this.formBuilderForm.patchValue({image: file});
  //   this.formBuilderForm.get('image')?.updateValueAndValidity();
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.imagePreview = reader.result;
  //   };
  //   if (file) {
  //       reader.readAsDataURL(file);
  //   }
  // }


  onFileUpload(e: Event) {
    console.log("inside fileupload")
    const imageBlob = <File>this.fileInput.nativeElement.files[0];
    const imageBlob1 = this.fileInput.nativeElement.files[0];

    const imageName = imageBlob.name;
    console.log("imageBlob", typeof imageBlob)    

    console.log("imageBlob", imageBlob, imageBlob.name);
    this.FILE = new FormData();
    this.FILE.append('file', imageBlob.name);
    this.FILE.append('file', imageBlob, imageName);
    console.log("getall", this.FILE.getAll('file'));
  }
   
    imagePath: any;

    postFormData() {
        let adhaarNumber = this.formBuilderForm.value.adhaarNumber;
        this.formBuilderForm.value.createdAt = this.myDate;
        try {
          if(!this.adhaarNumber.includes(adhaarNumber)) {
            console.log('this', this.formBuilderForm.value.image);
                this.formBuilderService.postFile(this.FILE).subscribe((event: HttpEvent<any>) => {
                   switch (event.type) {
                     case HttpEventType.Sent:
                       console.log("Request has been sent");
                        break;
                     case HttpEventType.ResponseHeader:
                       console.log('Response header has been recevied');
                        break;
                     case HttpEventType.UploadProgress:
                        if(event.total) {
                          this.progress = Math.round(event.loaded / event.total * 100);
                          console.log(`Uploaded! ${this.progress}%`)
                        } 
                       break;
                      case HttpEventType.Response:
                        console.log('User successfully created!', event.body); 
                        setTimeout(() => {
                          this.progress = 0;
                        }, 1500)   
                   }    
                });
                this.formBuilderService.postFormData(this.formBuilderForm.value).pipe(indicate(this.loading$)).subscribe( data => {
                if(data) {
                   this.getData();
                }
          });
         } else {
           this.snackbarService.openSnackBar("Adhaar Number Already exists Try another")
         }
        } catch(e) {
          this.snackbarService.openSnackBar("Unable to post data");
        }
  } 

   getData() {
      try {
          this.formBuilderService.getFormData(this.postsPerPage, this.currentPage).pipe(indicate(this.loading$)).subscribe(data => {
          this.formData = data.formdata;
          console.log("formdata", this.formData);
          for (var adhaarNumber of data.formdata) {
             this.adhaarNumber.push(adhaarNumber.adhaarNumber);    
          }
          this.snackbarService.openSnackBar("List Of User Details");
       });  
       } catch(e) {
         this.snackbarService.openSnackBar("unable to fetch data");
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

   deleteFormDataByName(event: Event, deleteImage: string ,keyUser: string, keyMobileNo: number ,index: number) {
        try { 
            this.formBuilderService.deleteFormDataByName(deleteImage ,keyUser, keyMobileNo).pipe(indicate(this.loading$)).subscribe(data => {
            this.formData.splice(index, 1);
            this.snackbarService.openSnackBar("User Deleted Successfully");
          });
        } catch(e) {
            this.snackbarService.openSnackBar("unable to deleted user");
        }
   }
}
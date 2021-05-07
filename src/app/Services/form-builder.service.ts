import { Injectable } from '@angular/core';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Form } from '../Modals/form.modal';
import { tap, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FormBuilderService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://localhost:3000/api';
  adhaarNumber!: number;
  email!: string; 

  // API for get form data by form builder
  getFormData(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/get-form-data')
    .pipe(tap(data => JSON.stringify(data), catchError(this.errorHandler)));
  }

  // API for post data from formbuilder
  postFormData(formData: Form, image: File): Observable<Form[]> {
    const postData = new FormData(); 
    postData.append("image", image);
     
    const userData = {
      formData,
      postData,
    };
    
     return this.http.post<Form[]>(this.baseUrl + '/post-form-data', userData)
       .pipe(tap(data => JSON.stringify(data), catchError(this.errorHandler)));
    }

    //http client api for update user
    updateFormBuilderServiceByName(email:string, adhaarNumber: number, formData: Form): Observable<Form> {
      const userInfo = {
        email,
        adhaarNumber,
        formData
       };
       console.log('userInfo', userInfo);
       return this.http.put<Form>(this.baseUrl + '/update-form-data' , userInfo)
      .pipe(tap(data => JSON.stringify(data), catchError(this.errorHandler)));
    }
    
    deleteFormDataByName(name: string, mobileno: number) {     
      const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: {
          name,
          mobileno
        },
      };

      console.log("this.baseUrl + '/delete-form-data-by-name', options'", this.baseUrl + '/delete-form-data-by-name', options);

      return this.http.delete(this.baseUrl + '/delete-form-data-by-name', options)
      .pipe(tap(data =>console.log(JSON.stringify(data)), catchError(this.errorHandler)));
    }

    setData(email: string, adhaarNumber: number) {
       this.adhaarNumber = adhaarNumber;
       this.email = email;
    }

    getData() {
      const email = this.email;
      const adhaarNumber = this.adhaarNumber;
       return {
          email,
          adhaarNumber
       }     
    }

    // error handler
    errorHandler(error: HttpErrorResponse): Observable<any>{
      return observableThrowError(error.message || 'serviceError');
   }
}

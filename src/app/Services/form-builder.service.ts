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
  updateData: any;

  // API for get form data by form builder
  getFormData(postsPerPage?: number, currentPage?: number): Observable<any> {

    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;

    return this.http.get<any>(this.baseUrl + '/get-form-data' + queryParams)
    .pipe(tap(data => JSON.stringify(data)), catchError(this.errorHandler));
  }

  // API for post data from formbuilder
  postFormData(formData: Form): Observable<any> {
    const userData = {formData}
    console.log("userData", userData);
     return this.http.post<any>(this.baseUrl + '/post-form-data', userData)
       .pipe(tap(data => JSON.stringify(data)), catchError(this.errorHandler));
    }

    postFile(image: any): Observable<any> {
      
      console.log("file---name", image);

      console.log("image.getAll('myFile')", image.getAll('myFile'));
  
      return this.http.post<any>(this.baseUrl + '/post-file', image)
      .pipe(tap(data => console.log(JSON.stringify(data))), catchError(this.errorHandler));
    } 

    //http client api for update user
    updateFormBuilderServiceByName(email:string, adhaarNumber: number, formData: any): Observable<any> {
      const userInfo = {
        email,
        adhaarNumber,
        formData
       };
       console.log('userInfo', userInfo);
       return this.http.put<any>(this.baseUrl + '/update-form-data' , userInfo)
      .pipe(tap(data => this.updateData = data), catchError(this.errorHandler));
    }
    
    deleteFormDataByName(deleteImage: string , name: string, mobileno: number) {     
      const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: {
          deleteImage,
          name,
          mobileno
        },
      };

      console.log("deleteImage", options);
      return this.http.delete(this.baseUrl + '/delete-form-data-by-name', options)
      .pipe(tap(data =>console.log(JSON.stringify(data))), catchError(this.errorHandler));
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

    getUpdateData() {
        const updateDATA = this.updateData;
        return updateDATA;
    }

    // error handler
    errorHandler(error: HttpErrorResponse): Observable<any>{
      return observableThrowError(error.message || 'serviceError');
   }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { user } from '../model/user'; 
import { LoginDetails } from '../model/logInDetails';
import { LoginResponse } from '../model/logInResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userURL: string = 'http://localhost:8080/api/users'; 

  private loggedInUserSubject: BehaviorSubject<LoginResponse | null> = new BehaviorSubject<LoginResponse | null>(null);
  public loggedInUser: Observable<LoginResponse | null> = this.loggedInUserSubject.asObservable();

  setLoggedInUser(loggedInUser: LoginResponse){
    this.loggedInUserSubject.next(loggedInUser);
  }

  clearLoggedInUser(){
    this.loggedInUserSubject.next(null);
  }
 

  constructor(private http: HttpClient) { }

  getUserbyCdsId(cdsID: string): Observable<user> {
    return this.http.get<user>(`${this.userURL}/cdsId/${cdsID}`);
  }

  login(cdsId: string, password: string): Observable<LoginResponse> {
    const userLogin: LoginDetails = {
      cdsId: cdsId,
      password: password
    };

    return this.http.post<LoginResponse>(`${this.userURL}/login`, userLogin);
  }
}



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { user } from '../model/user'; 
import { LoginDetails } from '../model/logInDetails';
import { LoginResponse } from '../model/logInResponse';
import { BasicUserInfo } from '../model/basicUserInfo';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userURL: string = 'http://localhost:8080/api/users'; 
  private readonly STORAGE_KEY = 'loggedInUser';

  private loggedInUserSubject: BehaviorSubject<LoginResponse | null>;
  public loggedInUser: Observable<LoginResponse | null>;

  constructor(private http: HttpClient) { 
    const storedUser = this.getStoredUser();
    this.loggedInUserSubject = new BehaviorSubject<LoginResponse | null>(storedUser);
    this.loggedInUser = this.loggedInUserSubject.asObservable();
  }

  setLoggedInUser(loggedInUser: LoginResponse): void {
    this.loggedInUserSubject.next(loggedInUser);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(loggedInUser));
  }

  clearLoggedInUser(): void {
    this.loggedInUserSubject.next(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): LoginResponse | null {
    return this.loggedInUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  private getStoredUser(): LoginResponse | null {
    const storedData = sessionStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData) as LoginResponse;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        sessionStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
    }
    return null;
  }

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

  getAllUsersBasicInfo(): Observable<BasicUserInfo[]> {
    return this.http.get<BasicUserInfo[]>(`${this.userURL}/all/basic-info`);
  }
}



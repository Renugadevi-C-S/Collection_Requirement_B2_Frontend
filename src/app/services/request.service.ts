import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { requestDetails } from '../model/requestDetails';
import { RequestSubmitResponse } from '../model/requestSubmitResponse';
import { requestsViewDetails } from '../model/requestsViewDetails';
import { requestUpdateDetails } from '../model/requestUpdateDetails';
import { RequestStatistics } from '../model/RequestStatistics';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private requestURL: string = 'http://localhost:8080/api/requests';

  constructor(private http: HttpClient) { }

  submitRequest(request: requestDetails): Observable<RequestSubmitResponse> {
    return this.http.post<RequestSubmitResponse>(`${this.requestURL}/newRequest`, request);
  }

  getRequestsByRequestorId(requestorId: string): Observable<requestsViewDetails[]> {
    return this.http.get<requestsViewDetails[]>(`${this.requestURL}/requestor/${requestorId}`);
  }

  getRequestById(requestId: number): Observable<requestsViewDetails> {
    return this.http.get<requestsViewDetails>(`${this.requestURL}/${requestId}`);
  }

  updateRequest(requestId: number, updateData: requestUpdateDetails): Observable<any> {
    return this.http.put(`${this.requestURL}/update/${requestId}`, updateData);
  }

  getAllRequests(): Observable<requestsViewDetails[]> {
    return this.http.get<requestsViewDetails[]>(`${this.requestURL}/all`);
  }

  deleteRequest(requestId: number): Observable<RequestSubmitResponse> {
    return this.http.delete<RequestSubmitResponse>(`${this.requestURL}/${requestId}`);
  }

 getRequestStatistics(): Observable<RequestStatistics> {
    return this.http.get<RequestStatistics>(`${this.requestURL}/statistics`);
  }
}

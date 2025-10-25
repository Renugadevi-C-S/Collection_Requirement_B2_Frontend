import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { requestDetails } from '../model/requestDetails';
import { RequestSubmitResponse } from '../model/requestSubmitResponse';
import { requestsViewDetails } from '../model/requestsViewDetails';

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

  getAllRequests(): Observable<requestsViewDetails[]> {
    return this.http.get<requestsViewDetails[]>(`${this.requestURL}/all`);
  }
}

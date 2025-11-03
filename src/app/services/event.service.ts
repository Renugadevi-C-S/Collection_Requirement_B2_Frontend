import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { approvedRequestForEvent } from '../model/approvedRequestForEvent';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'http://localhost:8080/api/events'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  // Get approved requests without events
  getApprovedRequestsWithoutEvent(): Observable<approvedRequestForEvent[]> {
    return this.http.get<approvedRequestForEvent[]>(`${this.baseUrl}/approved-requests`);
  }

  // Create event with optional request linking
  createEvent(eventData: any, cdsId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/create/${cdsId}`, eventData);
  }

  // Get all events
  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // Get events by cdsId
  getEventsByCdsId(cdsId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${cdsId}`);
  }
}

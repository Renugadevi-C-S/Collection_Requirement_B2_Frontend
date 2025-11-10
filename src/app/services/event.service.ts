import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailableRequest } from '../model/AvailableRequest';
import { EventDetails } from '../model/eventDetails';
import { EventViewDetails } from '../model/eventViewDetails';
import { EventSubmitResponse } from '../model/eventSubmitResponse';
import { EventStatistics } from '../model/EventStatistics';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'http://localhost:8080/api/events'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  getAvailableRequestsForEvent(): Observable<AvailableRequest[]> {
    return this.http.get<AvailableRequest[]>(`${this.baseUrl}/availableRequests`);
  }

  createEvent(eventData: EventDetails): Observable<EventSubmitResponse> {
    return this.http.post<EventSubmitResponse>(`${this.baseUrl}/create`, eventData);
  }

  getAllEvents(): Observable<EventViewDetails[]> {
    return this.http.get<EventViewDetails[]>(`${this.baseUrl}/all`);
  }

  getEventById(eventId: number): Observable<EventViewDetails> {
    return this.http.get<EventViewDetails>(`${this.baseUrl}/${eventId}`);
  }

  getEventsByCdsId(cdsId: string): Observable<EventViewDetails[]> {
    return this.http.get<EventViewDetails[]>(`${this.baseUrl}/creator/${cdsId}`);
  }

  updateEvent(eventId: number, eventData: EventDetails): Observable<EventSubmitResponse> {
    return this.http.patch<EventSubmitResponse>(`${this.baseUrl}/editEvent/${eventId}`, eventData);
  }

  deleteEvent(eventId: number): Observable<EventSubmitResponse> {
    return this.http.delete<EventSubmitResponse>(`${this.baseUrl}/${eventId}`);
  }

  getEventsByStatus(status: string): Observable<EventViewDetails[]> {
    return this.http.get<EventViewDetails[]>(`${this.baseUrl}/status/${status}`);
  }

  getEventsByType(eventType: string): Observable<EventViewDetails[]> {
    return this.http.get<EventViewDetails[]>(`${this.baseUrl}/type/${eventType}`);
  }

  getAvailableRequestsForEventEdit(eventId: number): Observable<AvailableRequest[]> {
    return this.http.get<AvailableRequest[]>(`${this.baseUrl}/availableRequests/${eventId}`);
  }

  getEventStatistics(): Observable<EventStatistics> {
    return this.http.get<EventStatistics>(`${this.baseUrl}/statistics`);
  }

}

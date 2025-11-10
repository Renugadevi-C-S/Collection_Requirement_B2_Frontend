import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { EventService } from '../../services/event.service';
import { RequestStatistics } from '../../model/RequestStatistics';
import { EventStatistics } from '../../model/EventStatistics';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ldspoc-dashboard-home.component.html',
  styleUrl: './ldspoc-dashboard-home.component.css'
})
export class LdspocDashboardHomeComponent implements OnInit, OnDestroy {

  requestStats: RequestStatistics | null = null;
  eventStats: EventStatistics | null = null;
  isLoadingStats: boolean = false;
  errorMessage: string = '';

  constructor(
    private requestService: RequestService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadStatistics(): void {
    this.isLoadingStats = true;
    this.errorMessage = '';

    // Load request statistics
    this.requestService.getRequestStatistics()
      .pipe(
        catchError(err => {
          console.error('Error loading request statistics:', err);
          this.errorMessage = 'Failed to load statistics. Please try again.';
          return of(null);
        })
      )
      .subscribe(stats => {
        this.requestStats = stats;
      });

    // Load event statistics
    this.eventService.getEventStatistics()
      .pipe(
        catchError(err => {
          console.error('Error loading event statistics:', err);
          this.errorMessage = 'Failed to load statistics. Please try again.';
          return of(null);
        })
      )
      .subscribe(stats => {
        this.eventStats = stats;
        this.isLoadingStats = false;
      });
  }

  refreshStatistics(): void {
    this.loadStatistics();
  }
}

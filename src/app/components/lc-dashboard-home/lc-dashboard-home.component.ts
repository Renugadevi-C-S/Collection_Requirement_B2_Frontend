import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { RequestStatistics } from '../../model/RequestStatistics';
import { UserService } from '../../services/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-lc-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lc-dashboard-home.component.html',
  styleUrl: './lc-dashboard-home.component.css'
})
export class LcDashboardHomeComponent implements OnInit, OnDestroy {

  requestStats: RequestStatistics | null = null;
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  isLoadingStats: boolean = false;
  errorMessage: string = '';

  constructor(
    private requestService: RequestService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadStatistics();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadStatistics(): void {
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    this.isLoadingStats = true;
    this.errorMessage = '';

    this.requestService.getRequestsByRequestorId(this.currentUser.cdsId)
      .pipe(
        catchError(err => {
          console.error('Error loading user requests:', err);
          // Check if it's a "not found" type error (which is normal when no requests exist)
          const errorMsg = err.error?.message || err.message || '';
          const isNotFoundError = errorMsg.toLowerCase().includes('not found') || 
                                  errorMsg.toLowerCase().includes('no request');
          
          if (!isNotFoundError) {
            // Only show error for actual errors, not for "no requests found"
            this.errorMessage = errorMsg || 'Failed to load statistics. Please try again.';
          }
          this.isLoadingStats = false;
          return of([]);
        })
      )
      .subscribe((response: any) => {
        this.isLoadingStats = false;
        if (response.exception != null) {
          // Check if it's a "not found" type message
          const isNotFoundError = response.message?.toLowerCase().includes('not found') || 
                                  response.message?.toLowerCase().includes('no request');
          
          if (!isNotFoundError) {
            // Only show error for actual errors, not for "no requests found"
            this.errorMessage = response.message || 'An error occurred while loading statistics.';
          }
          // Initialize with zero statistics when no requests found
          this.requestStats = {
            total: 0,
            submitted: 0,
            approved: 0,
            rejected: 0,
            inProgress: 0,
            completed: 0,
            deleted: 0
          };
        } else {
          // Calculate statistics from valid response
          const requests: requestsViewDetails[] = Array.isArray(response) ? response : [];
          this.requestStats = this.calculateStatistics(requests);
        }
      });
  }

  private calculateStatistics(requests: requestsViewDetails[]): RequestStatistics {
    const stats: RequestStatistics = {
      total: requests.length,
      submitted: 0,
      approved: 0,
      rejected: 0,
      inProgress: 0,
      completed: 0,
      deleted: 0
    };

    requests.forEach(request => {
      const status = request.requestStatus.toLowerCase();

      switch (status) {
        case 'submitted':
          stats.submitted++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'deleted':
          stats.deleted++;
          break;
      }
    });

    return stats;
  }

  refreshStatistics(): void {
    this.loadStatistics();
  }
}

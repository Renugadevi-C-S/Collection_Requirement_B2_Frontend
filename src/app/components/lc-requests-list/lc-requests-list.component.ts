import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../sevices/user.service';
import { RequestService } from '../../sevices/request.service';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-lc-requests-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lc-requests-list.component.html',
  styleUrl: './lc-requests-list.component.css'
})
export class LcRequestsListComponent implements OnInit, OnDestroy {

  requests: requestsViewDetails[] = [];
  filteredRequests: requestsViewDetails[] = [];
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  isLoading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';
  filterStatus: string = 'all';

  constructor(
    private userService: UserService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRequests();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadRequests(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.requestService.getRequestsByRequestorId(this.currentUser.cdsId)
      .pipe(
        catchError(err => {
          console.error('Error loading requests:', err);
          this.errorMessage = 'Failed to load requests. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(requests => {
        this.requests = requests;
        this.filteredRequests = requests;
        this.isLoading = false;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.requests];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(req => 
        req.requestStatus.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.eventName?.toLowerCase().includes(term) ||
        req.department?.toLowerCase().includes(term) ||
        req.justification?.toLowerCase().includes(term) ||
        req.requestId.toString().includes(term)
      );
    }

    this.filteredRequests = filtered;
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onStatusFilterChange(event: any): void {
    this.filterStatus = event.target.value;
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'in progress':
      case 'inprogress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  refreshRequests(): void {
    this.loadRequests();
  }
}


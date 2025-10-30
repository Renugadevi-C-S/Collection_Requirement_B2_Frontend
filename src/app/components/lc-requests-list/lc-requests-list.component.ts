import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../sevices/user.service';
import { RequestService } from '../../sevices/request.service';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-lc-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
  filters = {
    requestId: '',
    eventName: '',
    department: '',
    participants: null as number | null,
    requestDate: '',
    status: '',
    justification: ''
  };

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

    // Filter by Request ID
    if (this.filters.requestId) {
      filtered = filtered.filter(req => 
        req.requestId.toString().includes(this.filters.requestId)
      );
    }

    // Filter by Event Name
    if (this.filters.eventName) {
      const term = this.filters.eventName.toLowerCase();
      filtered = filtered.filter(req =>
        req.eventName?.toLowerCase().includes(term)
      );
    }

    // Filter by Department
    if (this.filters.department) {
      const term = this.filters.department.toLowerCase();
      filtered = filtered.filter(req =>
        req.department?.toLowerCase().includes(term)
      );
    }

    // Filter by Participants
    if (this.filters.participants !== null && this.filters.participants !== undefined) {
      filtered = filtered.filter(req =>
        req.noOfParticipants === this.filters.participants
      );
    }

    // Filter by Request Date
    if (this.filters.requestDate) {
      const term = this.filters.requestDate.toLowerCase();
      filtered = filtered.filter(req =>
        this.formatDate(req.requestDate).toLowerCase().includes(term)
      );
    }

    // Filter by Status
    if (this.filters.status) {
      filtered = filtered.filter(req => 
        req.requestStatus.toLowerCase() === this.filters.status.toLowerCase()
      );
    }

    // Filter by Justification
    if (this.filters.justification) {
      const term = this.filters.justification.toLowerCase();
      filtered = filtered.filter(req =>
        req.justification?.toLowerCase().includes(term)
      );
    }

    this.filteredRequests = filtered;
  }

  clearFilters(): void {
    this.filters = {
      requestId: '',
      eventName: '',
      department: '',
      participants: null,
      requestDate: '',
      status: '',
      justification: ''
    };
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


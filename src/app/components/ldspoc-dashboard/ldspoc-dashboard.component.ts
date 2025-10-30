
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../sevices/user.service';
import { RequestService } from '../../sevices/request.service';
import { LoginResponse } from '../../model/logInResponse';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { Subscription, catchError, of } from 'rxjs';


@Component({
  selector: 'app-ldspoc-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule, FormsModule],
  templateUrl: './ldspoc-dashboard.component.html',
  styleUrl: './ldspoc-dashboard.component.css'
})
export class LdspocDashboardComponent implements OnInit, OnDestroy {

  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  requests: requestsViewDetails[] = [];
  filteredRequests: requestsViewDetails[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showHomeContent: boolean = true;

  filters = {
    requestId: '',
    eventName: '',
    department: '',
    participants: null as number | null,
    requestDate: '',
    status: '',
    justification: '',
    requestedBy: ''
  };


  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRequests();
      }
    });

    // Check if we're on the home route
    this.router.events.subscribe(() => {
      this.showHomeContent = this.router.url === '/ldspoc-dashboard';
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  loadRequests(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.requestService.getAllRequests()
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

    // Filter by Requested By
    if (this.filters.requestedBy) {
      const term = this.filters.requestedBy.toLowerCase();
      filtered = filtered.filter(req =>
        req.requestedBy?.toLowerCase() === term
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
      justification: '',
      requestedBy: ''
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

  onNewRequest(): void {
    this.router.navigate(['ldspoc-dashboard/submit-request']);
  }

  onEditRequest(requestId: number): void {
    this.router.navigate(['ldspoc-dashboard/edit-request', requestId]);
  }

  onAcceptRequest(requestId: number): void {
    // Implement accept logic here
    console.log('Accepting request:', requestId);
    // You can add a confirmation dialog and then update the request status
    // this.requestService.updateRequestStatus(requestId, 'approved').subscribe(...);
  }

  onRejectRequest(requestId: number): void {
    // Implement reject logic here
    console.log('Rejecting request:', requestId);
    // You can add a confirmation dialog and then update the request status
    // this.requestService.updateRequestStatus(requestId, 'rejected').subscribe(...);
  }


    
}

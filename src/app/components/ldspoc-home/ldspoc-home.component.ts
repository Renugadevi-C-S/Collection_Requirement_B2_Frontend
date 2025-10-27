import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../sevices/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { catchError, of, Subscription } from 'rxjs';
import { RequestService } from '../../sevices/request.service';
import { requestsViewDetails } from '../../model/requestsViewDetails';

@Component({
  selector: 'app-ldspoc-home',
  imports: [CommonModule],
  templateUrl: './ldspoc-home.component.html',
  styleUrl: './ldspoc-home.component.css'
})
export class LdspocHomeComponent implements OnInit, OnDestroy {

  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  requests: requestsViewDetails[] = [];
  filteredRequests: requestsViewDetails[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';
  filterStatus: string = 'all';


  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private router:Router,
  ) {}

  ngOnInit(): void {
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


  onNewRequest(): void {
    this.router.navigate(['/ldspoc-dashboard/submit-request']);
  }

  onEditRequest(requestId: number): void {
    this.router.navigate(['/ldspoc-dashboard/edit-requests', requestId]);
  }

  // getStatusClass(status: string): string {
  //   return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  // }
  
}


import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RequestService } from '../../services/request.service';
import { ApprovalService } from '../../services/approval.service';
import { LoginResponse } from '../../model/logInResponse';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { NewApprovalDetails } from '../../model/newApprovalDetails';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-requests-list',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './ldspoc-requests-list.component.html',
  styleUrl: './ldspoc-requests-list.component.css'
})
export class LdspocRequestsListComponent implements OnInit, OnDestroy {

  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  requests: requestsViewDetails[] = [];
  filteredRequests: requestsViewDetails[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showHomeContent: boolean = true;

  // Modal properties
  showApprovalModal: boolean = false;
  selectedRequest: requestsViewDetails | null = null;
  approvalNotes: string = '';
  isApprovalAction: boolean = true; // true for approve, false for reject
  isSubmittingApproval: boolean = false;
  submissionError: string = '';
  showNotesError: boolean = false;

  // View details modal properties
  showViewModal: boolean = false;
  selectedViewRequest: requestsViewDetails | null = null;

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
    private approvalService: ApprovalService,
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
      .subscribe((requests: any) => {
        if(requests.exception != null){
          alert(requests.message);
        }
        else{
          this.requests = requests;
          this.filteredRequests = requests;
          this.isLoading = false;
          this.applyFilters();
        }
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
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.requestDate);
        const filterDate = new Date(this.filters.requestDate);
        return reqDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter out "Deleted" status by default (unless explicitly selected)
    if (this.filters.status) {
      filtered = filtered.filter(req =>
        req.requestStatus.toLowerCase() === this.filters.status.toLowerCase()
      );
    } else {
      // If no status filter selected, exclude "Deleted" requests by default
      filtered = filtered.filter(req =>
        req.requestStatus.toLowerCase() !== 'deleted'
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
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'in-progress':
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

  // Open approval modal
  onApproveRequest(request: requestsViewDetails): void {
    // Check if already approved
    if (request.requestStatus.toLowerCase() === 'approved') {
      return;
    }

    if (request.requestStatus.toLowerCase() === 'in-progress') {
      return;
    }

    if (request.requestStatus.toLowerCase() === 'completed') {
      return;
    }

    // Open modal directly
    this.selectedRequest = request;
    this.isApprovalAction = true;
    this.approvalNotes = '';
    this.submissionError = '';
    this.showNotesError = false;
    this.showApprovalModal = true;
  }

  onRejectRequest(request: requestsViewDetails): void {
    // Check if already rejected
    if (request.requestStatus.toLowerCase() === 'rejected') {
      return;
    }

    if (request.requestStatus.toLowerCase() === 'in-progress') {
      return;
    }

    if (request.requestStatus.toLowerCase() === 'completed') {
      return;
    }

    this.selectedRequest = request;
    this.isApprovalAction = false;
    this.approvalNotes = '';
    this.submissionError = '';
    this.showNotesError = false;
    this.showApprovalModal = true;
  }

  closeModal(): void {
    if (!this.isSubmittingApproval) {
      this.showApprovalModal = false;
      this.selectedRequest = null;
      this.approvalNotes = '';
      this.submissionError = '';
      this.showNotesError = false;
    }
  }

  submitApproval(): void {
    // Validate notes
    if (!this.approvalNotes || this.approvalNotes.trim().length < 10) {
      this.showNotesError = true;
      return;
    }

    if (!this.selectedRequest || !this.currentUser) {
      this.submissionError = 'Missing required information';
      return;
    }

    this.showNotesError = false;
    this.isSubmittingApproval = true;
    this.submissionError = '';

    const approvalDetails: NewApprovalDetails = {
      requestId: this.selectedRequest.requestId,
      approvedBy: this.currentUser.cdsId,
      approvalStatus: this.isApprovalAction ? 'Approved' : 'Rejected',
      approvalNotes: this.approvalNotes.trim()
    };

    this.approvalService.submitApproval(approvalDetails)
      .pipe(
        catchError(err => {
          console.error('Error submitting approval:', err);
          this.submissionError = 'Failed to submit. Please try again.';
          this.isSubmittingApproval = false;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response && response.exception != null) {
          alert(response.message);
          this.isSubmittingApproval = false;
        } else if (response) {
          // Update the request status in the local list
          const requestIndex = this.requests.findIndex(r => r.requestId === this.selectedRequest?.requestId);
          if (requestIndex !== -1) {
            this.requests[requestIndex].requestStatus = this.isApprovalAction ? 'Approved' : 'Rejected';
          }
          alert(response.message);

          this.applyFilters();

          // Close modal and reset
          this.showApprovalModal = false;
          this.selectedRequest = null;
          this.approvalNotes = '';
          this.isSubmittingApproval = false;

          // Optionally reload all requests to ensure data consistency
          this.loadRequests();
        } else {
          this.isSubmittingApproval = false;
        }
      });
  }


  viewRequestDetails(request: requestsViewDetails): void {
    this.selectedViewRequest = request;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedViewRequest = null;
  }

  // Helper method to check if edit button should be disabled
  isEditRequestDisabled(status: string): boolean {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'approved' ||
      lowerStatus === 'in-progress' ||
      lowerStatus === 'completed';
  }

  // Helper method to check if approve button should be disabled
  isApproveButtonDisabled(status: string): boolean {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'approved' ||
      lowerStatus === 'in-progress' ||
      lowerStatus === 'completed';
  }

  // Helper method to check if reject button should be disabled
  isRejectButtonDisabled(status: string): boolean {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'rejected' ||
      lowerStatus === 'in-progress' ||
      lowerStatus === 'completed';
  }

  // Helper method to check if delete button should be disabled
  isDeleteButtonDisabled(status: string): boolean {
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'in-progress';
  }

  // Helper method to get approve button title
  getApproveButtonTitle(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') {
      return 'Already Approved';
    } else if (lowerStatus === 'in-progress') {
      return 'Cannot approve in-progress request';
    } else if (lowerStatus === 'completed') {
      return 'Cannot approve completed request';
    }
    return 'Approve Request';
  }

  // Helper method to get reject button title
  getRejectButtonTitle(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'rejected') {
      return 'Already Rejected';
    } else if (lowerStatus === 'in-progress') {
      return 'Cannot reject in-progress request';
    } else if (lowerStatus === 'completed') {
      return 'Cannot reject completed request';
    }
    return 'Reject Request';
  }

  // Helper method to get edit button title
  getEditButtonTitle(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') {
      return 'Cannot edit approved request';
    } else if (lowerStatus === 'in-progress') {
      return 'Cannot edit in-progress request';
    } else if (lowerStatus === 'completed') {
      return 'Cannot edit completed request';
    }
    return 'Edit Request';
  }

  // Helper method to get delete button title
  getDeleteButtonTitle(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'in-progress') {
      return 'Cannot delete in-progress request';
    } else if (lowerStatus === 'completed') {
      return 'Cannot delete completed request';
    }
    return 'Delete Request';
  }

  // Delete request method
  onDeleteRequest(requestId: number): void {
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      this.requestService.deleteRequest(requestId)
        .pipe(
          catchError(err => {
            console.error('Error deleting request:', err);
            alert('Failed to delete request: ' + (err.error?.message || err.message));
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            alert(response.message);
            this.loadRequests(); // Refresh the list
          }
        });
    }
  }
}


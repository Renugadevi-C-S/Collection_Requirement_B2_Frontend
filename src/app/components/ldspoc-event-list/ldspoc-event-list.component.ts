import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { EventService } from '../../services/event.service';
import { EventViewDetails } from '../../model/eventViewDetails';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ldspoc-event-list.component.html',
  styleUrl: './ldspoc-event-list.component.css'
})
export class LdspocEventListComponent implements OnInit, OnDestroy {

  events: EventViewDetails[] = [];
  filteredEvents: EventViewDetails[] = [];
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Modal properties for detailed view
  showModal: boolean = false;
  selectedEvent: EventViewDetails | null = null;
  isLoadingDetails: boolean = false;

  showApprovalModal: boolean = false;
  selectedEventForApproval: EventViewDetails | null = null;
  approvalNotes: string = '';
  isApprovalAction: boolean = true;
  isSubmittingApproval: boolean = false;
  submissionError: string = '';
  showNotesError: boolean = false;

  filters = {
    eventName: '',
    eventType: '',
    status: '',
    createdBy: ''
  };

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadEvents();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/ldspoc-dashboard/create-event']);
  }

  loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getAllEvents()
      .pipe(
        catchError(err => {
          console.error('Error loading events:', err);
          this.errorMessage = 'Failed to load events. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(events => {
        this.events = events;
        this.filteredEvents = events;
        this.isLoading = false;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.filters.eventName) {
      const term = this.filters.eventName.toLowerCase();
      filtered = filtered.filter(evt =>
        evt.eventName?.toLowerCase().includes(term)
      );
    }

    if (this.filters.eventType) {
      const term = this.filters.eventType.toLowerCase();
      filtered = filtered.filter(evt =>
        evt.eventType?.toLowerCase().includes(term)
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter(evt =>
        evt.status.toLowerCase() === this.filters.status.toLowerCase()
      );
    } else {
      filtered = filtered.filter(evt =>
        evt.status.toLowerCase() !== 'deleted'
      );
    }


    if (this.filters.createdBy) {
      const term = this.filters.createdBy.toLowerCase();
      filtered = filtered.filter(evt =>
        evt.createdBy?.toLowerCase().includes(term)
      );
    }

    this.filteredEvents = filtered;
  }

  clearFilters(): void {
    this.filters = {
      eventName: '',
      eventType: '',
      status: '',
      createdBy: ''
    };
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'planned':
        return 'status-pending';
      case 'in progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
      case 'rejected':
        return 'status-rejected';
      case 'approved':
        return 'status-approved';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-default';
    }
  }

  refreshEvents(): void {
    this.loadEvents();
  }

  // Fetch full event details including linked requests
  viewEventDetails(event: EventViewDetails): void {
    this.isLoadingDetails = true;
    this.showModal = true;
    this.selectedEvent = null;

    this.eventService.getEventById(event.eventId)
      .pipe(
        catchError(err => {
          console.error('Error loading event details:', err);
          alert('Failed to load event details. Please try again.');
          this.isLoadingDetails = false;
          this.showModal = false;
          return of(null);
        })
      )
      .subscribe(eventDetails => {
        if (eventDetails) {
          this.selectedEvent = eventDetails;
        }
        this.isLoadingDetails = false;
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEvent = null;
  }

  // Edit event - Navigate to edit page
  editEvent(eventId: number): void {
    this.router.navigate(['/ldspoc-dashboard/edit-event', eventId]);
  }

  // Delete event with confirmation
  deleteEvent(eventId: number): void {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.eventService.deleteEvent(eventId)
        .pipe(
          catchError(err => {
            console.error('Error deleting event:', err);
            alert('Failed to delete event: ' + (err.error?.message || err.message));
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            alert(response.message);
            this.loadEvents();
          }
        });
    }
  }

  // Complete Event - Opens completion modal with validation
  onCompleteEvent(event: EventViewDetails): void {
    // Check if already completed
    if (event.status.toLowerCase() === 'completed') {
      return;
    }

    // Check if event is cancelled - cannot complete a cancelled event
    if (event.status.toLowerCase() === 'cancelled') {
      alert('❌ Cannot complete a cancelled event.\n\nCancelled events cannot be changed to completed status.');
      return;
    }

    // Check if event is deleted - cannot complete a deleted event
    if (event.status.toLowerCase() === 'deleted') {
      return;
    }

    // Show confirmation message before opening modal
    const confirmMessage =
      'Once an event is marked as COMPLETED, it CANNOT be cancelled.\n\n' +
      'All linked requests will be marked as "Completed"\n' +
      'This action cannot be undone\n\n' +
      'Do you want to proceed with completing this event?';

    if (!confirm(confirmMessage)) {
      return;
    }

    this.selectedEventForApproval = event;
    this.isApprovalAction = true;
    this.approvalNotes = '';
    this.submissionError = '';
    this.showNotesError = false;
    this.showApprovalModal = true;
  }

  // Cancel Event - Opens cancellation modal with validation
  onCancelEvent(event: EventViewDetails): void {
    // Check if already cancelled
    if (event.status.toLowerCase() === 'cancelled') {
      return;
    }

    // Check if event is completed - cannot cancel a completed event
    if (event.status.toLowerCase() === 'completed') {
      alert('❌ Cannot cancel a completed event.\n\nCompleted events cannot be cancelled.');
      return;
    }

    // Check if event is deleted - cannot cancel a deleted event
    if (event.status.toLowerCase() === 'deleted') {
      return;
    }

    // Show confirmation message before opening modal
    const confirmMessage =
      'Once an event is marked as CANCELLED, it CANNOT be completed.\n\n' +
      ' All linked requests will be UNLINKED from this event\n' +
      ' Request statuses will be changed back to "Approved"\n' +
      ' This action cannot be undone\n\n' +
      'Do you want to proceed with cancelling this event?';

    if (!confirm(confirmMessage)) {
      return;
    }

    this.selectedEventForApproval = event;
    this.isApprovalAction = false;
    this.approvalNotes = '';
    this.submissionError = '';
    this.showNotesError = false;
    this.showApprovalModal = true;
  }

  // Close Approval/Rejection Modal
  closeApprovalModal(): void {
    if (!this.isSubmittingApproval) {
      this.showApprovalModal = false;
      this.selectedEventForApproval = null;
      this.approvalNotes = '';
      this.submissionError = '';
      this.showNotesError = false;
    }
  }

  submitEventApproval(): void {
    if (!this.approvalNotes || this.approvalNotes.trim().length < 10) {
      this.showNotesError = true;
      return;
    }

    if (!this.selectedEventForApproval || !this.currentUser) {
      this.submissionError = 'Missing required information';
      return;
    }

    this.showNotesError = false;
    this.isSubmittingApproval = true;
    this.submissionError = '';

    const newStatus = this.isApprovalAction ? 'Completed' : 'Cancelled';

    const eventData: any = {
      status: newStatus,
      eventName: this.selectedEventForApproval.eventName,
      description: this.selectedEventForApproval.description,
      duration: this.selectedEventForApproval.duration,
      eventType: this.selectedEventForApproval.eventType,
      fundingSource: this.selectedEventForApproval.fundingSource,
      createdBy: this.selectedEventForApproval.createdBy
    };

    // Add completion or cancellation fields based on action
    if (this.isApprovalAction) {
      // Completion fields
      eventData.completedBy = this.currentUser.cdsId;
      eventData.completionNotes = this.approvalNotes.trim();
      eventData.completedDate = new Date().toISOString().split('T')[0];
    } else {
      // Cancellation fields
      eventData.cancelledBy = this.currentUser.cdsId;
      eventData.cancellationNotes = this.approvalNotes.trim();
      eventData.cancelledDate = new Date().toISOString().split('T')[0];
    }

    this.eventService.updateEvent(this.selectedEventForApproval.eventId, eventData)
      .pipe(
        catchError(err => {
          console.error('Error submitting event approval:', err);
          this.submissionError = err.error || 'Failed to submit. Please try again.';
          this.isSubmittingApproval = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Update the event status in the local list
          const eventIndex = this.events.findIndex(e => e.eventId === this.selectedEventForApproval?.eventId);
          if (eventIndex !== -1) {
            this.events[eventIndex].status = newStatus;

            // Update local event with completion/cancellation data
            if (this.isApprovalAction) {
              this.events[eventIndex].completedBy = this.currentUser!.cdsId;
              this.events[eventIndex].completionNotes = this.approvalNotes.trim();
              this.events[eventIndex].completedDate = new Date().toISOString().split('T')[0];
            } else {
              this.events[eventIndex].cancelledBy = this.currentUser!.cdsId;
              this.events[eventIndex].cancellationNotes = this.approvalNotes.trim();
              this.events[eventIndex].cancelledDate = new Date().toISOString().split('T')[0];
            }
          }

          const message = this.isApprovalAction
            ? `Event "${this.selectedEventForApproval?.eventName}" has been COMPLETED.\n\n` +
            ` Completed by: ${this.currentUser!.cdsId}`
            : ` Event "${this.selectedEventForApproval?.eventName}" has been CANCELLED.\n\n`;

          alert(message + `\n\nNotes: ${this.approvalNotes}`);

          this.applyFilters();

          // Close modal and reset
          this.showApprovalModal = false;
          this.selectedEventForApproval = null;
          this.approvalNotes = '';
          this.isSubmittingApproval = false;

          this.loadEvents();
        } else {
          this.isSubmittingApproval = false;
        }
      });
  }

  // Helper method to format date
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  shouldShowCompleteButton(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    return status !== 'deleted' && status !== 'completed';
  }

  shouldShowCancelButton(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    return status !== 'deleted' && status !== 'cancelled';
  }

  // Helper method to check if Complete button should be disabled
  isCompleteButtonDisabled(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    // Disable if Completed or Cancelled
    return status === 'completed' || status === 'cancelled';
  }

  // Helper method to check if Cancel button should be disabled
  isCancelButtonDisabled(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    // Disable if Cancelled or Completed
    return status === 'cancelled' || status === 'completed';
  }

  // Helper method to check if Edit Event button should be shown
  shouldShowEditButton(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    //  Hide Edit button completely for Deleted events
    return status !== 'deleted';
  }

// Helper method to check if Edit Event button should be disabled
  isEditEventButtonDisabled(event: EventViewDetails): boolean {
    const status = event.status.toLowerCase();
    // Disable Edit button for Completed or Cancelled events
    return status === 'completed' || status === 'cancelled';
  }

// Helper method to get edit button title
  getEditEventButtonTitle(event: EventViewDetails): string {
    const status = event.status.toLowerCase();
    if (status === 'completed') {
      return 'Cannot edit completed event';
    } else if (status === 'cancelled') {
      return 'Cannot edit cancelled event';
    }
    return 'Edit Event';
  }


}

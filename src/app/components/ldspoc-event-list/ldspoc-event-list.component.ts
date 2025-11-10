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

  filters = {
    eventId: '',
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
      .subscribe((events: any) => {
        if(events.exception != null){
          alert(events.message);
        }
        else{
          this.events = events;
          this.filteredEvents = events;
          this.isLoading = false;
          this.applyFilters();
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.events];

    if (this.filters.eventId) {
      filtered = filtered.filter(evt =>
        evt.eventId.toString().includes(this.filters.eventId)
      );
    }

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
      eventId: '',
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
        return 'status-rejected';
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
      .subscribe((eventDetails: any) => {
        if (eventDetails.exception != null) {
          alert(eventDetails.message);
        }
        else{
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
            this.loadEvents(); // Refresh the list
          }
        });
    }
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
}

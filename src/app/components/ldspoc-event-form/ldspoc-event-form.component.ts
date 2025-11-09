import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { catchError, of } from 'rxjs';
import { AvailableRequest } from '../../model/AvailableRequest';

@Component({
  selector: 'app-ldspoc-event-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ldspoc-event-form.component.html',
  styleUrl: './ldspoc-event-form.component.css'
})
export class LdspocEventFormComponent implements OnInit {
  eventForm!: FormGroup;
  currentUser: LoginResponse | null = null;
  availableRequests: AvailableRequest[] = [];
  selectedRequests: Set<number> = new Set();
  isSubmitting: boolean = false;
  isLoadingRequests: boolean = false;
  errorMessage: string = '';
  calculatedParticipants: number = 0;
  showRequestsSection: boolean = false;

  //Edit mode properties
  isEditMode: boolean = false;
  eventId: number | null = null;
  isLoading: boolean = false;
  originalCreatorId: string = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });

    this.initializeForm();

    //Check for edit mode via route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.eventId = +params['id'];
        this.isEditMode = true;
        this.loadEventData();
      } else {
        this.isEditMode = false;
        this.originalCreatorId = this.currentUser?.cdsId || '';
        this.loadApprovedRequests();
      }
    });
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      eventType: ['', Validators.required],
      fundingSource: ['L&D Budget', Validators.required],
      status: ['Planned', Validators.required]
    });
  }

  //Load event data for editing
  loadEventData(): void {
    if (!this.eventId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEventById(this.eventId)
      .pipe(
        catchError(err => {
          console.error('Error loading event data:', err);
          this.errorMessage = 'Failed to load event data. Please try again.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(event => {
        if (event) {
          this.originalCreatorId = event.createdBy || '';
          this.populateForm(event);

          // If event has linked requests, load them and show selection
          if (event.linkedRequests && event.linkedRequests.length > 0) {
            this.loadApprovedRequests();
            // Pre-select linked requests
            event.linkedRequests.forEach(req => {
              this.selectedRequests.add(req.requestId);
            });
            this.calculateTotalParticipants();
            this.showRequestsSection = true;
          }
        } else {
          this.errorMessage = 'Event not found.';
        }
        this.isLoading = false;
      });
  }

  //Populate form with event data
  populateForm(event: any): void {
    this.eventForm.patchValue({
      eventName: event.eventName || '',
      description: event.description || '',
      duration: event.duration || '',
      eventType: event.eventType || '',
      fundingSource: event.fundingSource || 'L&D Budget',
      status: event.status || 'Planned'
    });
  }

  //Get display creator ID
  getDisplayCreatorId(): string {
    if (this.isEditMode) {
      return this.originalCreatorId;
    }
    return this.currentUser?.cdsId || '';
  }

  loadApprovedRequests(): void {
    this.isLoadingRequests = true;
    const requestObservable = this.isEditMode && this.eventId
      ? this.eventService.getAvailableRequestsForEventEdit(this.eventId)
      : this.eventService.getAvailableRequestsForEvent();

    requestObservable
      .pipe(
        catchError(err => {
          console.error('Error loading approved requests:', err);
          this.errorMessage = 'Failed to load approved requests';
          this.isLoadingRequests = false;
          return of([]);
        })
      )
      .subscribe((requests: AvailableRequest[]) => {
        this.availableRequests = requests;
        this.isLoadingRequests = false;
      });
  }

  toggleRequestSelection(requestId: number): void {
    if (this.selectedRequests.has(requestId)) {
      this.selectedRequests.delete(requestId);
    } else {
      this.selectedRequests.add(requestId);
    }
    this.calculateTotalParticipants();
  }

  isRequestSelected(requestId: number): boolean {
    return this.selectedRequests.has(requestId);
  }

  calculateTotalParticipants(): void {
    this.calculatedParticipants = 0;
    this.selectedRequests.forEach(requestId => {
      const request = this.availableRequests.find(r => r.requestId === requestId);
      if (request) {
        this.calculatedParticipants += request.noOfParticipants;
      }
    });
  }

  toggleRequestsSection(): void {
    this.showRequestsSection = !this.showRequestsSection;
  }

  selectAllRequests(): void {
    this.availableRequests.forEach(req => {
      this.selectedRequests.add(req.requestId);
    });
    this.calculateTotalParticipants();
  }

  clearAllRequests(): void {
    this.selectedRequests.clear();
    this.calculatedParticipants = 0;
  }

  //Submit handles both CREATE and EDIT
  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (!this.currentUser && !this.isEditMode) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Check if editing or creating
    if (this.isEditMode && this.eventId) {
      // EDIT MODE - Update existing event
      const eventData = {
        eventName: this.eventForm.value.eventName,
        description: this.eventForm.value.description,
        duration: parseInt(this.eventForm.value.duration),
        eventType: this.eventForm.value.eventType,
        fundingSource: this.eventForm.value.fundingSource,
        status: this.eventForm.value.status,
        requestIds: Array.from(this.selectedRequests),
        createdBy: this.originalCreatorId
      };

      console.log('Updating event (createdBy will NOT be changed):', eventData);

      this.eventService.updateEvent(this.eventId, eventData)
        .pipe(
          catchError(err => {
            console.error('Event update error:', err);
            console.error('Error status:', err.status);
            console.error('Error message:', err.error);
            alert('Error updating event: ' + (err.error?.message || err.message));
            this.isSubmitting = false;
            return of(null);
          })
        )
        .subscribe(response => {
          this.isSubmitting = false;
          if (response) {
            alert('Event updated successfully! Creator ID remains: ' + this.originalCreatorId);
            this.router.navigate(['/ldspoc-dashboard/view-events']);
          }
        });
    } else {
      // CREATE MODE - Create new event
      const eventData = {
        ...this.eventForm.value,
        requestIds: Array.from(this.selectedRequests),
        createdBy: this.currentUser!.cdsId
      };

      console.log('Creating new event with creator ID:', this.currentUser!.cdsId);

      this.eventService.createEvent(eventData)
        .pipe(
          catchError(err => {
            console.error('Error creating event:', err);
            this.errorMessage = err.error?.message || 'Failed to create event. Please try again.';
            this.isSubmitting = false;
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            alert(response.message || 'Event created successfully!');
            this.router.navigate(['/ldspoc-dashboard/view-events']);
          }
          this.isSubmitting = false;
        });
    }
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadEventData();
    } else {
      this.eventForm.reset({
        fundingSource: 'L&D Budget',
        status: 'Planned'
      });
      this.selectedRequests.clear();
      this.calculatedParticipants = 0;
      this.errorMessage = '';
    }
  }

  //Cancel button
  onCancel(): void {
    this.router.navigate(['/ldspoc-dashboard/view-events']);
  }

  onBack(): void {
    this.router.navigate(['/ldspoc-dashboard/view-events']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field?.hasError('min')) {
      return `Minimum value is ${field.errors?.['min'].min}`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      eventName: 'Event Name',
      description: 'Description',
      duration: 'Duration',
      eventType: 'Event Type',
      fundingSource: 'Funding Source',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

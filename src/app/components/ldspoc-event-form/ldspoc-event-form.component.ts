import { Component,OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { approvedRequestForEvent } from '../../model/approvedRequestForEvent';
import { LoginResponse } from '../../model/logInResponse';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-event-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ldspoc-event-form.component.html',
  styleUrl: './ldspoc-event-form.component.css'
})
export class LdspocEventFormComponent implements OnInit {
  eventForm!: FormGroup;
  currentUser: LoginResponse | null = null;
  approvedRequests: approvedRequestForEvent[] = [];
  selectedRequests: Set<number> = new Set();
  isSubmitting: boolean = false;
  isLoadingRequests: boolean = false;
  errorMessage: string = '';
  calculatedParticipants: number = 0;
  showRequestsSection: boolean = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });

    this.initializeForm();
    this.loadApprovedRequests();
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      eventType: ['', Validators.required],
      fundingSource: ['', Validators.required],
      status: ['Planned', Validators.required]
    });
  }

  loadApprovedRequests(): void {
    this.isLoadingRequests = true;
    this.eventService.getApprovedRequestsWithoutEvent()
      .pipe(
        catchError(err => {
          console.error('Error loading approved requests:', err);
          this.errorMessage = 'Failed to load approved requests';
          this.isLoadingRequests = false;
          return of([]);
        })
      )
      .subscribe(requests => {
        this.approvedRequests = requests;
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
      const request = this.approvedRequests.find(r => r.requestId === requestId);
      if (request) {
        this.calculatedParticipants += request.noOfParticipants;
      }
    });
  }

  toggleRequestsSection(): void {
    this.showRequestsSection = !this.showRequestsSection;
  }

  selectAllRequests(): void {
    this.approvedRequests.forEach(req => {
      this.selectedRequests.add(req.requestId);
    });
    this.calculateTotalParticipants();
  }

  clearAllRequests(): void {
    this.selectedRequests.clear();
    this.calculatedParticipants = 0;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const eventData = {
      ...this.eventForm.value,
      requestIds: Array.from(this.selectedRequests)
    };

    this.eventService.createEvent(eventData, this.currentUser.cdsId)
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
          this.router.navigate(['/ldspoc-dashboard']);
        }
        this.isSubmitting = false;
      });
  }

  onReset(): void {
    this.eventForm.reset({
      status: 'Planned'
    });
    this.selectedRequests.clear();
    this.calculatedParticipants = 0;
    this.errorMessage = '';
  }

  onBack(): void {
    this.router.navigate(['/ldspoc-dashboard']);
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

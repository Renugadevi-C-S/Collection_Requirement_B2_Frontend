import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestService } from '../../sevices/request.service';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-edit-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ldspoc-edit-form.component.html',
  styleUrl: './ldspoc-edit-form.component.css'
})
export class LdspocEditFormComponent implements OnInit {
  requestForm!: FormGroup;
  isEditMode: boolean = false;
  requestId: string | null = null; // Changed from number to string
  isLoading: boolean = false;
  errorMessage: string = '';
  requestData: requestsViewDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize the form first
    this.initializeForm();

    // Check for route parameter (request ID for editing)
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      
      if (params['id']) {
        this.requestId = params['id']; // Removed the + conversion
        this.isEditMode = true;
        console.log('Edit mode - Loading request ID:', this.requestId);
        this.loadRequestData();
      } else {
        console.log('Create mode - New request');
        this.isEditMode = false;
      }
    });
  }

  initializeForm(): void {
    this.requestForm = this.fb.group({
      eventName: ['', Validators.required],
      department: ['', Validators.required],
      noOfParticipants: [0, [Validators.required, Validators.min(1)]],
      requestDate: [new Date().toISOString().split('T')[0], Validators.required],
      requestStatus: ['Pending'],
      justification: ['', Validators.required],
    });
  }

  loadRequestData(): void {
    if (!this.requestId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.requestService.getRequestsByRequestorId(this.requestId)
    .pipe(
      catchError(err => {
        console.error('Error loading request data:', err);
        this.errorMessage = 'Failed to load request data. Please try again.';
        this.isLoading = false;
        return of([]);  // Changed from of(null) to of([])
      })
    )
    .subscribe(requests => {  // Changed 'request' to 'requests' (it's an array)
      if (requests && requests.length > 0) {
        console.log('Request data loaded:', requests[0]);
        this.requestData = requests[0];  // Get the first item from array
        this.populateForm(requests[0]);
      } else {
        this.errorMessage = 'Request not found.';
      }
      this.isLoading = false;
    });
  }

  populateForm(request: requestsViewDetails): void {
    console.log('Populating form with data:', request);
    
    // Format date if needed
    let formattedDate = request.requestDate;
    if (request.requestDate) {
      const date = new Date(request.requestDate);
      formattedDate = date.toISOString().split('T')[0];
    }

    this.requestForm.patchValue({
      eventName: request.eventName || '',
      department: request.department || '',
      noOfParticipants: request.noOfParticipants || 0,
      requestDate: formattedDate,
      requestStatus: request.requestStatus || 'Pending',
      justification: request.justification || '',
    });

    console.log('Form populated. Current form value:', this.requestForm.value);
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      console.log('Form is invalid');
      Object.keys(this.requestForm.controls).forEach(key => {
        const control = this.requestForm.get(key);
        if (control?.invalid) {
          console.log(`Invalid field: ${key}`, control.errors);
        }
      });
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    const formData = this.requestForm.value;
    console.log('Submitting form data:', formData);

    if (this.isEditMode && this.requestId) {
      // Update existing request
      this.isLoading = true;
      this.requestService.updateRequest(this.requestId, formData) // Now passes string
        .pipe(
          catchError(err => {
            console.error('Error updating request:', err);
            this.errorMessage = 'Failed to update request. Please try again.';
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            console.log('Request updated successfully:', response);
            alert('Request updated successfully!');
            this.router.navigate(['/ldspoc-dashboard']);
          }
          this.isLoading = false;
        });
    } else {
      // Create new request
      this.isLoading = true;
      this.requestService.submitRequest(formData)
        .pipe(
          catchError(err => {
            console.error('Error creating request:', err);
            this.errorMessage = 'Failed to create request. Please try again.';
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            console.log('Request created successfully:', response);
            alert('Request created successfully!');
            this.router.navigate(['/ldspoc-dashboard']);
          }
          this.isLoading = false;
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/ldspoc-dashboard']);
  }

  // Helper method to mark all fields as touched (for validation display)
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}


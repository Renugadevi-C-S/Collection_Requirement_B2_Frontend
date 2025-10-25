import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../sevices/user.service';
import { RequestService } from '../../sevices/request.service';
import { requestDetails } from '../../model/requestDetails';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-lc-request-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lc-request-form.component.html',
  styleUrl: './lc-request-form.component.css'
})
export class LcRequestFormComponent implements OnInit, OnDestroy {

  requestForm!: FormGroup;
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  selectedFileName: string = 'No file selected';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });

    this.requestForm = this.fb.group({
      justification: ['', [Validators.required, Validators.minLength(10)]],
      tanNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      noOfParticipants: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      department: ['', Validators.required],
      curriculum: [null]
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.requestForm.patchValue({
        curriculum: file
      });
    } else {
      this.selectedFileName = 'No file selected';
      this.requestForm.patchValue({
        curriculum: null
      });
    }
  }

  onSubmit(): void {
    if (this.requestForm.valid && this.currentUser) {
      this.isSubmitting = true;

      const requestData: requestDetails = {
        requestorId: this.currentUser.cdsId,
        justification: this.requestForm.value.justification,
        tanNo: this.requestForm.value.tanNo,
        noOfParticipants: parseInt(this.requestForm.value.noOfParticipants),
        department: this.requestForm.value.department,
        curriculum: this.selectedFileName // Backend expects string - link of curriculam file
      };

      console.log('Submitting request:', requestData);

      this.requestService.submitRequest(requestData)
        .pipe(
          catchError(err => {
            console.error('Request submission error:', err);
            alert('Error submitting request: ' + (err.error?.message || err.message));
            this.isSubmitting = false;
            return of(null);
          })
        )
        .subscribe(response => {
          this.isSubmitting = false;
          if (response) {
            alert(response.message);
            this.requestForm.reset();
            this.selectedFileName = 'No file selected';
            this.router.navigate(['/lc-dashboard/view-requests']);
          }
        });
    } else {
      Object.keys(this.requestForm.controls).forEach(key => {
        this.requestForm.controls[key].markAsTouched();
      });
      alert('Please fill in all required fields correctly.');
    }
  }

  onReset(): void {
    this.requestForm.reset();
    this.selectedFileName = 'No file selected';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.requestForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `Value must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `Value must not exceed ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `Invalid format for ${fieldName}`;
    }
    return '';
  }
}

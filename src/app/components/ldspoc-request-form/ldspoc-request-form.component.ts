import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RequestService } from '../../services/request.service';
import { requestDetails } from '../../model/requestDetails';
import { requestUpdateDetails } from '../../model/requestUpdateDetails';
import { requestsViewDetails } from '../../model/requestsViewDetails';
import { LoginResponse } from '../../model/logInResponse';
import { BasicUserInfo } from '../../model/basicUserInfo';
import { Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ldspoc-request-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ldspoc-request-form.component.html',
  styleUrl: './ldspoc-request-form.component.css'
})
export class LdspocRequestFormComponent implements OnInit, OnDestroy {

  requestForm!: FormGroup;
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  selectedFileName: string = 'No file selected';
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  requestId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  originalRequestorId: string = '';

  // Participant management
  allUsers: BasicUserInfo[] = [];
  filteredUsers: BasicUserInfo[] = [];
  selectedParticipants: BasicUserInfo[] = [];
  searchControl = new FormControl('');
  showUserDropdown: boolean = false;
  private blurTimeout: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });

    this.initializeForm();

    // Load all users for participant selection
    this.loadUsers();

    // Setup search listener
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterUsers(searchTerm || '');
      if (searchTerm && searchTerm.trim()) {
        this.showUserDropdown = true;
      }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = +params['id'];
        this.isEditMode = true;
        this.loadRequestData();
      } else {
        this.isEditMode = false;
        this.originalRequestorId = this.currentUser?.cdsId || '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  initializeForm(): void {
    this.requestForm = this.fb.group({
      justification: ['', [Validators.required, Validators.minLength(10)]],
      tanNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      noOfParticipants: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      department: ['', Validators.required],
      curriculum: [null]
    });
  }

  loadUsers(): void {
    this.userService.getAllUsersBasicInfo()
      .pipe(
        catchError(err => {
          console.error('Error loading users:', err);
          alert('Failed to load user list');
          return of([]);
        })
      )
      .subscribe(users => {
        this.allUsers = users;
        this.filteredUsers = users;
        console.log('Loaded users:', users.length);
      });
  }

  filterUsers(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredUsers = this.allUsers;
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter(user => 
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.cdsId.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  // Get available users (exclude already selected)
  getAvailableUsers(): BasicUserInfo[] {
    const selectedCdsIds = this.selectedParticipants.map(p => p.cdsId);
    return this.filteredUsers.filter(user => !selectedCdsIds.includes(user.cdsId));
  }

  onSearchFocus(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
    this.showUserDropdown = true;
  }

  onSearchBlur(): void {
    // Delay closing to allow click events to fire
    this.blurTimeout = setTimeout(() => {
      this.showUserDropdown = false;
    }, 300);
  }

  onDropdownMouseEnter(): void {
    // Clear blur timeout when mouse enters dropdown
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  onDropdownMouseLeave(): void {
    // Don't auto-close when mouse leaves
  }

  // Use mousedown event to add participant (fires before blur)
  onUserSelect(event: MouseEvent, user: BasicUserInfo): void {
    event.preventDefault();
    event.stopPropagation();
    this.addParticipant(user);
  }

  addParticipant(user: BasicUserInfo): void {
    console.log('Adding participant:', user);
    
    // Check if user is already added
    const isAlreadyAdded = this.selectedParticipants.some(p => p.cdsId === user.cdsId);
    
    if (isAlreadyAdded) {
      alert(`${user.firstName} ${user.lastName} (${user.cdsId}) is already added to participants`);
      return;
    }

    // Add to selected participants
    this.selectedParticipants = [...this.selectedParticipants, user];
    console.log('Selected participants:', this.selectedParticipants);
    
    // Clear search but keep dropdown open
    this.searchControl.setValue('', { emitEvent: false });
    this.filteredUsers = this.allUsers;
    
    // Keep dropdown open and refocus on input
    this.showUserDropdown = true;
  }

  removeParticipant(event: MouseEvent, cdsId: string): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Removing participant:', cdsId);
    this.selectedParticipants = this.selectedParticipants.filter(p => p.cdsId !== cdsId);
    console.log('Remaining participants:', this.selectedParticipants);
  }

  validateParticipantCount(): boolean {
    const expectedCount = parseInt(this.requestForm.get('noOfParticipants')?.value);
    const actualCount = this.selectedParticipants.length;
    
    if (isNaN(expectedCount) || expectedCount <= 0) {
      return true;
    }
    
    return expectedCount === actualCount;
  }

  getParticipantCountMessage(): string {
    const expectedCount = parseInt(this.requestForm.get('noOfParticipants')?.value);
    const actualCount = this.selectedParticipants.length;
    
    if (isNaN(expectedCount) || expectedCount <= 0) {
      return '';
    }
    
    if (actualCount < expectedCount) {
      return `Please add ${expectedCount - actualCount} more participant(s)`;
    } else if (actualCount > expectedCount) {
      return `Please remove ${actualCount - expectedCount} participant(s)`;
    } else {
      return 'Participant count matches ✓';
    }
  }

  loadRequestData(): void {
    if (!this.requestId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.requestService.getRequestById(this.requestId)
      .pipe(
        catchError(err => {
          console.error('Error loading request data:', err);
          this.errorMessage = 'Failed to load request data. Please try again.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(request => {
        if (request) {
          this.originalRequestorId = request.requestedBy || '';
          this.populateForm(request);
        } else {
          this.errorMessage = 'Request not found.';
        }
        this.isLoading = false;
      });
  }

  populateForm(request: requestsViewDetails): void {
    this.requestForm.patchValue({
      justification: request.justification || '',
      tanNo: request.tanNo || '',
      noOfParticipants: request.noOfParticipants || 0,
      department: request.department || '',
      curriculum: request.curriculum || ''
    });

    if (request.curriculum) {
      this.selectedFileName = request.curriculum;
    }
  }

  getDisplayRequestorId(): string {
    if (this.isEditMode) {
      return this.originalRequestorId;
    }
    return this.currentUser?.cdsId || '';
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
    if (this.requestForm.invalid) {
      this.markFormGroupTouched(this.requestForm);
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (!this.validateParticipantCount()) {
      alert('Number of participants must match the number of selected users. ' + this.getParticipantCountMessage());
      return;
    }

    if (this.selectedParticipants.length === 0) {
      alert('Please add at least one participant to the request.');
      return;
    }

    if (!this.currentUser && !this.isEditMode) {
      alert('User not logged in.');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.requestId) {
      const updateData: requestUpdateDetails = {
        department: this.requestForm.value.department,
        tanNo: this.requestForm.value.tanNo,
        noOfParticipants: parseInt(this.requestForm.value.noOfParticipants),
        curriculum: this.selectedFileName,
        justification: this.requestForm.value.justification
      };

      console.log('Updating request (requestorId will NOT be changed):', updateData);

      this.requestService.updateRequest(this.requestId, updateData)
        .pipe(
          catchError(err => {
            console.error('Request update error:', err);
            alert('Error updating request: ' + (err.error?.message || err.message));
            this.isSubmitting = false;
            return of(null);
          })
        )
        .subscribe(response => {
          this.isSubmitting = false;
          if (response) {
            alert('Request updated successfully! Requestor ID remains: ' + this.originalRequestorId);
            this.router.navigate(['/ldspoc-dashboard']);
          }
        });
    } else {
      const requestData: requestDetails = {
        requestorId: this.currentUser!.cdsId,
        justification: this.requestForm.value.justification,
        tanNo: this.requestForm.value.tanNo,
        noOfParticipants: parseInt(this.requestForm.value.noOfParticipants),
        department: this.requestForm.value.department,
        curriculum: this.selectedFileName,
        usersCdsId: this.selectedParticipants.map(p => p.cdsId)
      };

      console.log('Creating new request with requestor ID:', this.currentUser!.cdsId);

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
            alert(response.message || 'Request submitted successfully!');
            this.requestForm.reset();
            this.selectedFileName = 'No file selected';
            this.selectedParticipants = [];
            this.searchControl.setValue('');
            this.router.navigate(['/ldspoc-dashboard']);
          }
        });
    }
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadRequestData();
      this.selectedParticipants = [];
    } else {
      this.requestForm.reset();
      this.selectedFileName = 'No file selected';
      this.selectedParticipants = [];
      this.searchControl.setValue('');
    }
  }

  onCancel(): void {
    this.router.navigate(['/ldspoc-dashboard']);
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, LoginResponse } from '../../sevices/user.service';
import { Observable, catchError, of } from 'rxjs'; 
import { user } from '../../model/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  fetchUser!: Observable<user>; 
  errorMessage: string = ''; 
  logInUserDetails!: LoginResponse;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userId: ['', Validators.required], 
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = ''; 

    if (this.loginForm.valid) {
      const { userId, password } = this.loginForm.value;
      console.log('Login attempt with:', { userId, password });

      this.userService.login(userId, password)
        .pipe(
          catchError(err => {
            console.error('Login error:', err);
            alert(err.message);
            return of(null); 
          })
        )
        .subscribe((response: LoginResponse | null) => {
          if (response) {
            this.logInUserDetails = response;
            console.log('Login successful:', response);
            switch (response.role) {
              case 'LC':
                this.router.navigate(['/lc-dashboard']);
                break;
              case 'L&DSPoC':
                this.router.navigate(['/ldspoc-dashboard']);
                break;
              default:
                this.errorMessage = 'You do not have permission to access any dashboard.';
                console.warn('Unauthorized role:', response.role);
                alert(this.errorMessage);
                break;
            }
          } else {
            console.log('Login failed (response was null after error handling).');
          }
        });
    } else {
      this.errorMessage = 'Please enter both CDS ID and password.';
      console.warn('Login form is invalid.');
    }
  }
}

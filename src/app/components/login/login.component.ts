import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../sevices/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Observable, catchError, of } from 'rxjs'; 

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
  errorMessage: string = ''; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.redirectToDashboard(currentUser.role);
    }

    this.loginForm = this.fb.group({
      userId: ['', Validators.required], 
      password: ['', Validators.required]
    });
  }

  private redirectToDashboard(role: string): void {
    if (role === 'LC') {
      this.router.navigate(['/lc-dashboard']);
    } else if (role === 'LNDSPOC') {
      this.router.navigate(['/ldspoc-dashboard']);
    }
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
        .subscribe((response: any | null) => {
          if (response) {
             
            console.log('Login response:', response);
            if(response.status == 400){
              alert(response.message);
            }
            else{
              this.redirectToDashboard(response.role);
              this.userService.setLoggedInUser(response);
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

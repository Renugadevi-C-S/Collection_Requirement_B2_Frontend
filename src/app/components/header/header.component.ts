import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  fordLogo = 'ford-logo.png';
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return '';
  }

  logout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.userService.clearLoggedInUser();
      this.router.navigate(['/login']);
    }
  }
}

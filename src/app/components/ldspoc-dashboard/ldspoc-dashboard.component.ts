import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../sevices/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ldspoc-dashboard',
  imports: [CommonModule],
  templateUrl: './ldspoc-dashboard.component.html',
  styleUrl: './ldspoc-dashboard.component.css'
})
export class LdspocDashboardComponent implements OnInit, OnDestroy {
  
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }
}

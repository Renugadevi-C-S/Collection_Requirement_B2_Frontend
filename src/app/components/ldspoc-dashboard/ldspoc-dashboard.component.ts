import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RequestService } from '../../services/request.service';
import { EventService } from '../../services/event.service';
import { LoginResponse } from '../../model/logInResponse';
import { RequestStatistics } from '../../model/RequestStatistics';
import { EventStatistics } from '../../model/EventStatistics';
import { Subscription, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ldspoc-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './ldspoc-dashboard.component.html',
  styleUrl: './ldspoc-dashboard.component.css'
})
export class LdspocDashboardComponent implements OnInit, OnDestroy {

  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  isLoading: boolean = false;

  requestStats: RequestStatistics | null = null;
  eventStats: EventStatistics | null = null;
  isLoadingStats: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private requestService: RequestService,
    private eventService: EventService
  ) {}

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

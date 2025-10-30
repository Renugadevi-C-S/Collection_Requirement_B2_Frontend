import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LcRequestsListComponent } from '../lc-requests-list/lc-requests-list.component';

@Component({
  selector: 'app-lc-dashboard',
  standalone: true,
  imports: [CommonModule, LcRequestsListComponent, RouterOutlet],
  templateUrl: './lc-dashboard.component.html',
  styleUrl: './lc-dashboard.component.css'
})
export class LcDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('requestsList') requestsList!: LcRequestsListComponent;
  
  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  private routerSubscription?: Subscription;
  isLoading: boolean = false;
  currentRoute: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });

    // Track current route
    this.currentRoute = this.router.url;
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  navigateToNewRequest(): void {
    this.router.navigate(['/lc-dashboard/submit-request']);
  }

  reloadRequests(): void {
    if (this.requestsList) {
      this.requestsList.refreshRequests();
    }
  }

  showRequestsList(): boolean {
    // Show requests list only when on the main dashboard route
    return this.currentRoute === '/lc-dashboard' || this.currentRoute === '/lc-dashboard/';
  }
}


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Subscription} from 'rxjs';

@Component({
  selector: 'app-ldspoc-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet,RouterOutlet],
  templateUrl: './ldspoc-dashboard.component.html',
  styleUrl: './ldspoc-dashboard.component.css'
})
export class LdspocDashboardComponent implements OnInit, OnDestroy {

  currentUser: LoginResponse | null = null;
  private userSubscription?: Subscription;
  isLoading: boolean = false;
  


  constructor(
    private userService: UserService,
    private router: Router
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

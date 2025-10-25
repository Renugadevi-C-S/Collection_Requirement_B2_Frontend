import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../../sevices/user.service';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../model/logInResponse';

@Component({
  selector: 'app-lc-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './lc-dashboard.component.html',
  styleUrl: './lc-dashboard.component.css'
})
export class LcDashboardComponent implements OnInit {

  loggedInUser: Observable<LoginResponse | null>;
  currentUser: LoginResponse | null = null;
  constructor(private userService: UserService){
    this.loggedInUser = userService.loggedInUser;
  }
  ngOnInit(): void {
    this.loggedInUser.subscribe( user => {
      this.currentUser = user;
    })

  }

}

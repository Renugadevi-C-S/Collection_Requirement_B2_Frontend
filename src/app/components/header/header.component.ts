import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../sevices/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  {
  
  loggedInUser: any;

  constructor(private router: Router, private userService: UserService) {
    this.loggedInUser = userService.loggedInUser;
  }

  logout(): void {
    this.userService.clearLoggedInUser();
    this.router.navigate(['/login']);
  }
}

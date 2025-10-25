import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../sevices/user.service';
import { LoginResponse } from '../../model/logInResponse';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  
  loggedInUser: Observable<LoginResponse | null>;
  currentUser: LoginResponse | null = null;

  constructor(private router: Router, private userService: UserService) {
    this.loggedInUser = userService.loggedInUser;
  }
  ngOnInit(): void {
    this.loggedInUser.subscribe(user => {
      this.currentUser = user;
    });
  }       
    
  

  logout(): void {
    if(window.confirm(`${this.currentUser?.firstName}, want to LogOut?`)){
      this.userService.clearLoggedInUser();
      this.router.navigate(['/login']);
    }
  }
}

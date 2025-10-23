import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-lc-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './lc-dashboard.component.html',
  styleUrl: './lc-dashboard.component.css'
})
export class LcDashboardComponent {

}

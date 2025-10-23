import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component'; // Import your component
import { LcDashboardComponent } from './components/lc-dashboard/lc-dashboard.component';
import { LdspocDashboardComponent } from './components/ldspoc-dashboard/ldspoc-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'lc-dashboard', component: LcDashboardComponent },
  { path: 'ldspoc-dashboard', component: LdspocDashboardComponent },
  // ... other routes (e.g., for dashboard)
];

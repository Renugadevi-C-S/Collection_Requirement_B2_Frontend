import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LcDashboardComponent } from './components/lc-dashboard/lc-dashboard.component';
import { LdspocDashboardComponent } from './components/ldspoc-dashboard/ldspoc-dashboard.component';
import { LcRequestFormComponent } from './components/lc-request-form/lc-request-form.component';
import { LcRequestsListComponent } from './components/lc-requests-list/lc-requests-list.component';
<<<<<<< HEAD
import { LdspocRequestFormComponent } from './components/ldspoc-request-form/ldspoc-request-form.component';
import { LdspocRquestsListComponent } from './components/ldspoc-rquests-list/ldspoc-rquests-list.component';
import { LdspocEventFormComponent } from './components/ldspoc-event-form/ldspoc-event-form.component';
import { LdspocEventListComponent } from './components/ldspoc-event-list/ldspoc-event-list.component';
=======
import { authGuard, roleGuard } from './guards/auth.guard';
>>>>>>> origin/raamji

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'lc-dashboard',
    component: LcDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LC','ADMIN'] },
    children: [
<<<<<<< HEAD
          { path: 'submit-request', component: LcRequestFormComponent },
          { path: 'view-requests', component: LcRequestsListComponent }
        ]
   },
  { path: 'ldspoc-dashboard', component: LdspocDashboardComponent ,
    children: [
          { path: 'submit-request', component: LdspocRequestFormComponent },
          { path: 'view-requests', component: LdspocRquestsListComponent },
          { path: 'create-event', component: LdspocEventFormComponent },
          { path: 'view-events', component: LdspocEventListComponent }
        ]
  },
=======
      { path: 'submit-request', component: LcRequestFormComponent },
      { path: 'view-requests', component: LcRequestsListComponent }
    ]
  },
  { 
    path: 'ldspoc-dashboard', 
    component: LdspocDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LNDSPOC','ADMIN'] }
  },
  { path: '**', redirectTo: '/login' }
>>>>>>> origin/raamji
];


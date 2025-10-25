import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../sevices/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    return true;
  } else {
    alert("You must be logged in to access this page.");
    userService.clearLoggedInUser();
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    userService.clearLoggedInUser();
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data['roles'] as string[];
  
  if (expectedRoles && expectedRoles.length > 0) {
    if (expectedRoles.includes(currentUser.role)) {
      return true;
    } else {
      alert('Access Denied: You do not have permission to access this page.');
      userService.clearLoggedInUser();
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};

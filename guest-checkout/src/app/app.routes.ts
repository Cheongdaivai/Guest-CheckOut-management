import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'checkout',
    pathMatch: 'full'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/guest-checkout/guest-checkout.component')
      .then(m => m.GuestCheckoutComponent)
  }
]; 
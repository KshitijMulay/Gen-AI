import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart.component').then((m) => m.CartComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./order-history.component').then((m) => m.OrderHistoryComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('./landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/add',
    loadComponent: () =>
      import('./product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./wishlist.component').then((m) => m.WishlistComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./logout.component').then((m) => m.LogoutComponent),
  },
];

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { WishlistService } from './services/wishlist.service';
import { Router } from '@angular/router';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatBadgeModule, MatIconModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent implements OnInit, OnDestroy {
  cartCount = 0;
  wishlistCount = 0;
  isLoggedIn = false;
  isDarkMode = false;
  private destroy$ = new Subject<void>();
  
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private themeService: ThemeService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.checkAuthStatus();
    // this.cartService.refreshCartCount();
    // this.cartService.cartCount$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((count) => {
    //     this.cartCount = count;
    //   });
    
    this.wishlistService.wishlistItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.wishlistCount = items.length;
      });
    
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDarkMode = isDark;
      });
  }
  
  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  
  isAdmin(): boolean {
    const token = localStorage.getItem('jwtToken');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'ADMIN';
    } catch {
      return false;
    }
  }
  
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.cartCount = 0;
    this.wishlistCount = 0;
    // Clear wishlist data
    this.wishlistService.clearWishlist();
    this.router.navigate(['/']);
  }
  
  toggleTheme() {
    this.themeService.toggleDarkMode();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

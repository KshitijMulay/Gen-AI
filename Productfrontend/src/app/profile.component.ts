import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService, Product } from './services/product.service';
import { ImageService } from './services/image.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatSnackBarModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  myProducts: Product[] = [];
  loading = false;
  currentUser = '';
  userPassword = '';
  userRole = 'User';
  showPassword = false;
  isDarkMode = false;
  
  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';

  constructor(
    private productService: ProductService,
    private imageService: ImageService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadMyProducts();
    
    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  
  loadUserInfo() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = payload.sub || payload.username || 'Unknown';
        this.userRole = payload.role || 'User';
        // Password should never be stored or displayed for security
        this.userPassword = ''; // Will be fetched securely when needed
      } catch {
        this.currentUser = 'Unknown';
        this.userRole = 'User';
      }
    }
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loadMyProducts() {
    this.loading = true;
    this.productService.getMyProducts().subscribe({
      next: (products) => {
        this.myProducts = products;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load your products', 'Close', { duration: 2000 });
        this.loading = false;
      }
    });
  }

  getProductImage(product: Product): string {
    return product.imageUrl || this.imageService.getProductImage(product.name);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.imageService.getProductImage('default');
  }

  deleteProduct(id?: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 2000 });
          this.loadMyProducts();
        },
        error: () => {
          this.snackBar.open('Failed to delete product', 'Close', { duration: 2000 });
        }
      });
    }
  }
}
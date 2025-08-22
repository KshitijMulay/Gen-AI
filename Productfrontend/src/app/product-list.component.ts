import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService, Product } from './services/product.service';
import { CartService } from './services/cart.service';
import { ImageService } from './services/image.service';
import { NotificationService } from './services/notification.service';
import { WishlistService } from './services/wishlist.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductModalComponent } from './product-modal.component';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    ProductModalComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  totalElements = 0;
  pageSize = 12;
  pageIndex = 0;
  search = '';
  error: string | null = null;
  loading = false;
  isAdmin = false;
  currentUser = '';
  selectedProduct: Product | null = null;
  sortBy: string = '';
  private searchTimeout: any;
  
  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private imageService: ImageService,
    private notificationService: NotificationService,
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadProducts();
  }
  
  getCurrentUser() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = payload.sub || payload.username || '';
      } catch {
        this.currentUser = '';
      }
    }
  }
  
  canEditProduct(product: Product): boolean {
    return this.isAdmin || product.createdByUsername === this.currentUser;
  }

  loadProducts(page: number = 0, size: number = 12, search: string = '') {
    this.loading = true;
    this.error = null;
    
    this.productService.getAllProducts(page, size, search, this.sortBy).subscribe({
      next: (res) => {
        this.products = res.content;
        this.totalElements = res.totalElements;
        this.pageSize = res.size;
        this.pageIndex = res.number;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      },
    });
  }

  onPage(event: PageEvent) {
    this.loadProducts(event.pageIndex, event.pageSize, this.search);
  }

  onSearch() {
    this.loadProducts(0, this.pageSize, this.search);
  }

  handleAddToCart(product: Product) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.addToCart(product);
  }

  handleWishlist(product: Product) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.toggleWishlist(product);
  }

  private addToCart(product: Product) {
    if (!product.id) {
      this.notificationService.showError('Invalid product.');
      return;
    }
    
    this.cartService.addToCart(product.id, 1).subscribe({
      next: (cart) => {
        this.notificationService.showSuccess('Product added to cart!');
        this.cartService.updateCartCount();
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
        const message = err?.error?.message || 'Failed to add product to cart.';
        this.notificationService.showError(message);
      },
    });
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  async deleteProduct(id?: number) {
    if (!id) return;
    
    const confirmed = await this.notificationService.confirm('Are you sure you want to delete this product?');
    if (confirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Product deleted successfully');
          this.loadProducts(this.pageIndex, this.pageSize, this.search);
        },
        error: () => {
          this.notificationService.showError('Failed to delete product');
        },
      });
    }
  }

  getProductImage(product: Product): string {
    return product.imageUrl || this.imageService.getProductImage(product.name);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.imageService.getProductImage('default');
  }

  quickView(product: Product) {
    this.selectedProduct = product;
  }
  
  closeModal() {
    this.selectedProduct = null;
  }
  
  onSearchInput(event: Event) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 500);
  }
  
  clearSearch() {
    this.search = '';
    this.onSearch();
  }
  
  onSortChange() {
    this.pageIndex = 0; // Reset to first page when sorting
    this.loadProducts(this.pageIndex, this.pageSize, this.search);
  }

  private toggleWishlist(product: Product) {
    if (this.wishlistService.isInWishlist(product.id!)) {
      this.wishlistService.removeFromWishlist(product.id!).subscribe(() => {
        this.notificationService.showInfo(`Removed ${product.name} from wishlist`);
      });
    } else {
      this.wishlistService.addToWishlist(product).subscribe(() => {
        this.notificationService.showSuccess(`Added ${product.name} to wishlist`);
      });
    }
  }
  
  isInWishlist(product: Product): boolean {
    return this.wishlistService.isInWishlist(product.id!);
  }

}

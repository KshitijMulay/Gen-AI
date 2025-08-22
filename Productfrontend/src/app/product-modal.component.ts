import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from './services/product.service';
import { CartService } from './services/cart.service';
import { ImageService } from './services/image.service';
import { WishlistService } from './services/wishlist.service';
import { NotificationService } from './services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent {
  @Input() product!: Product;
  @Output() close = new EventEmitter<void>();
  
  quantity = 1;
  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop';

  constructor(
    private cartService: CartService,
    private imageService: ImageService,
    private wishlistService: WishlistService,
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  getProductImage(product: Product): string {
    return product.imageUrl || this.imageService.getProductImage(product.name);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.imageService.getProductImage('default');
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.product.id) {
      this.notificationService.showError('Invalid product.');
      return;
    }
    
    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => {
        this.notificationService.showSuccess(`${this.quantity} item(s) added to cart!`);
        this.cartService.refreshCartCount();
        this.closeModal();
      },
      error: (err) => {
        const message = err?.error?.message || 'Failed to add product to cart.';
        this.notificationService.showError(message);
      },
    });
  }

  addToWishlist() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(this.product.id!).subscribe(() => {
        this.notificationService.showInfo(`Removed ${this.product.name} from wishlist`);
      });
    } else {
      this.wishlistService.addToWishlist(this.product).subscribe(() => {
        this.notificationService.showSuccess(`Added ${this.product.name} to wishlist`);
      });
    }
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
  
  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id!);
  }

  closeModal() {
    this.close.emit();
  }
}
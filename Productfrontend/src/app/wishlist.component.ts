import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WishlistService } from './services/wishlist.service';
import { CartService } from './services/cart.service';
import { NotificationService } from './services/notification.service';
import { ImageService } from './services/image.service';
import { Product } from './services/product.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="wishlist-container">
      <div class="wishlist-header">
        <h1>My Wishlist</h1>
        <p *ngIf="wishlistItems.length > 0">{{ wishlistItems.length }} item(s) in your wishlist</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="wishlistItems.length === 0" class="empty-state">
        <mat-icon class="empty-icon">favorite_border</mat-icon>
        <h3>Your wishlist is empty</h3>
        <p>Add products you love to your wishlist</p>
        <button class="browse-btn" routerLink="/products">
          <mat-icon>shopping_bag</mat-icon>
          Browse Products
        </button>
      </div>

      <!-- Wishlist Items -->
      <div *ngIf="wishlistItems.length > 0" class="wishlist-grid">
        <div *ngFor="let item of wishlistItems" class="wishlist-item">
          <div class="item-image">
            <img [src]="getProductImage(item)" [alt]="item.name" (error)="onImageError($event)">
            <button class="remove-btn" (click)="removeFromWishlist(item.id!)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-price">{{ item.price | currency:'INR' }}</div>
            <div class="item-actions">
              <button class="add-to-cart-btn" (click)="addToCart(item)">
                <mat-icon>shopping_cart</mat-icon>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .wishlist-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .wishlist-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 4rem !important;
      width: 4rem !important;
      height: 4rem !important;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .browse-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      transition: transform 0.3s ease;
    }

    .browse-btn:hover {
      transform: translateY(-2px);
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .wishlist-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease;
    }

    .wishlist-item:hover {
      transform: translateY(-4px);
    }

    .item-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .remove-btn:hover {
      background: #ffebee;
      color: #e91e63;
    }

    .item-info {
      padding: 1.5rem;
    }

    .item-info h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .item-info p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .item-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0071e3;
      margin-bottom: 1rem;
    }

    .add-to-cart-btn {
      background: #0071e3;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.3s ease;
      width: 100%;
      justify-content: center;
    }

    .add-to-cart-btn:hover {
      background: #005bb5;
    }

    @media (max-width: 768px) {
      .wishlist-container {
        padding: 1rem;
      }
      
      .wishlist-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: Product[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    // Refresh wishlist from backend
    this.wishlistService.refreshWishlist();
    
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe(() => {
      this.notificationService.showInfo('Removed from wishlist');
    });
  }

  addToCart(product: Product) {
    if (!product.id) return;
    
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.notificationService.showSuccess('Added to cart!');
        this.cartService.refreshCartCount();
      },
      error: () => {
        this.notificationService.showError('Failed to add to cart');
      }
    });
  }

  getProductImage(product: Product): string {
    return product.imageUrl || this.imageService.getProductImage(product.name);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.imageService.getProductImage('default');
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService, CartItem } from './services/cart.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  displayedColumns = ['productName', 'price', 'quantity', 'total', 'actions'];

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
      },
      error: () => {
        this.snackBar.open('Failed to load cart', 'Close', { duration: 2000 });
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.priceAtAddTime * item.quantity,
      0
    );
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity <= 0) {
      this.snackBar.open('Quantity must be greater than 0', 'Close', { duration: 2000 });
      return;
    }
    
    this.cartService.updateCartItem(item.id, quantity).subscribe({
      next: () => {
        this.snackBar.open('Quantity updated', 'Close', { duration: 2000 });
        this.loadCart();
        this.cartService.refreshCartCount();
      },
      error: () => {
        this.snackBar.open('Failed to update quantity', 'Close', { duration: 2000 });
      }
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeCartItem(item.id).subscribe({
      next: () => {
        this.snackBar.open('Item removed', 'Close', { duration: 2000 });
        this.loadCart();
        this.cartService.refreshCartCount();
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 2000 });
      }
    });
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Cart is empty', 'Close', { duration: 2000 });
      return;
    }
    
    this.cartService.checkoutCart().subscribe({
      next: () => {
        this.snackBar.open('Checkout successful!', 'Close', { duration: 2000 });
        this.loadCart();
        this.cartService.refreshCartCount();
      },
      error: () => {
        this.snackBar.open('Checkout failed', 'Close', { duration: 2000 });
      }
    });
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = Number(input.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      this.updateQuantity(item, newQuantity);
    }
  }

  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';

  getCartProductImage(item: CartItem): string {
    if (item.product?.imageUrl) {
      return item.product.imageUrl;
    }
    // Use product name for consistent image generation
    const productName = item.productNameAtAddTime || 'default';
    return this.imageService.getProductImage(productName);
  }

  onCartImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.imageService.getProductImage('default');
  }
  
  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Cart is empty', 'Close', { duration: 2000 });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}

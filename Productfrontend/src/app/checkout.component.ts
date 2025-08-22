import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService, CartItem } from './services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  loading = false;
  error: string | null = null;
  shippingCost = 50;
  taxRate = 0.18; // 18% GST
  
  private readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkoutForm = this.fb.group({
      // Shipping Address
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{10,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      
      // Payment Method
      paymentMethod: ['cod', Validators.required],
      
      // Card Details (conditional)
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      cardName: [''],
      
      // UPI Details (conditional)
      upiId: ['']
    });
  }

  ngOnInit() {
    this.loadCartItems();
    this.setupConditionalValidators();
  }

  loadCartItems() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
        if (this.cartItems.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.snackBar.open('Failed to load cart items', 'Close', { duration: 2000 });
        this.router.navigate(['/cart']);
      }
    });
  }

  setupConditionalValidators() {
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      // Clear previous validators
      this.checkoutForm.get('cardNumber')?.clearValidators();
      this.checkoutForm.get('expiryDate')?.clearValidators();
      this.checkoutForm.get('cvv')?.clearValidators();
      this.checkoutForm.get('cardName')?.clearValidators();
      this.checkoutForm.get('upiId')?.clearValidators();

      // Add validators based on payment method
      if (method === 'card') {
        this.checkoutForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]);
        this.checkoutForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
        this.checkoutForm.get('cardName')?.setValidators([Validators.required, Validators.minLength(2)]);
      } else if (method === 'upi') {
        this.checkoutForm.get('upiId')?.setValidators([Validators.required, Validators.pattern(/^[\w\.\-_]+@[\w\-_]+$/)]);
      }

      // Update validity
      this.checkoutForm.get('cardNumber')?.updateValueAndValidity();
      this.checkoutForm.get('expiryDate')?.updateValueAndValidity();
      this.checkoutForm.get('cvv')?.updateValueAndValidity();
      this.checkoutForm.get('cardName')?.updateValueAndValidity();
      this.checkoutForm.get('upiId')?.updateValueAndValidity();
    });
  }

  getProductImage(item: CartItem): string {
    return item.product?.imageUrl || this.DEFAULT_IMAGE;
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getFinalTotal(): number {
    return this.getSubtotal() + this.shippingCost + this.getTax();
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    // Simulate payment processing
    setTimeout(() => {
      // TODO: Integrate with actual payment gateway
      this.processOrder();
    }, 2000);
  }

  private processOrder() {
    const orderData = {
      ...this.checkoutForm.value,
      items: this.cartItems,
      subtotal: this.getSubtotal(),
      shipping: this.shippingCost,
      tax: this.getTax(),
      total: this.getFinalTotal()
    };

    // For now, just simulate successful order
    this.cartService.checkoutCart().subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.cartService.refreshCartCount();
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to place order. Please try again.';
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
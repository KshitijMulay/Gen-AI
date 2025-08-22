import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from './product.service';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  priceAtAddTime: number;
  productNameAtAddTime: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = environment.apiUrl + '/cart';

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  refreshCartCount() {
    this.getCart().subscribe({
      next: (cart) => {
        this.cartCountSubject.next(cart.items ? cart.items.length : 0);
      },
      error: () => {
        this.cartCountSubject.next(0);
      }
    });
  }

  addToCart(productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(
      `${this.apiUrl}/add?productId=${productId}&quantity=${quantity}`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateCartCount() {
    this.refreshCartCount();
  }

  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(
      `${this.apiUrl}/item/${itemId}?quantity=${quantity}`,
      {}
    ).pipe(catchError(this.handleError));
  }

  removeCartItem(itemId: number): Observable<Cart> {
    return this.updateCartItem(itemId, 0);
  }

  checkoutCart(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/checkout`,
      {},
      { responseType: 'text' }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Cart API Error:', error?.message || 'Unknown error');
    return throwError(() => error);
  }
}

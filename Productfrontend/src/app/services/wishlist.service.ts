import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from './product.service';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems = new BehaviorSubject<Product[]>([]);
  wishlistItems$ = this.wishlistItems.asObservable();
  private apiUrl = environment.apiUrl + '/api/wishlist';

  constructor(private http: HttpClient) {
    this.loadWishlistFromBackend();
  }

  private loadWishlistFromBackend() {
    const token = localStorage.getItem('jwtToken');
    console.log('Loading wishlist, token exists:', !!token);
    if (!token) {
      this.wishlistItems.next([]);
      return;
    }

    console.log('Fetching wishlist from:', this.apiUrl);
    this.http.get<Product[]>(this.apiUrl)
      .pipe(catchError((error) => {
        console.error('Error loading wishlist:', error);
        this.wishlistItems.next([]);
        return [];
      }))
      .subscribe(items => {
        console.log('Wishlist loaded:', items);
        this.wishlistItems.next(items || []);
      });
  }

  addToWishlist(product: Product): Observable<any> {
    console.log('Adding to wishlist:', product.id, 'API URL:', `${this.apiUrl}/${product.id}`);
    return this.http.post(`${this.apiUrl}/${product.id}`, {}, { responseType: 'text' })
      .pipe(
        tap((response) => {
          console.log('Add to wishlist response:', response);
          // Refresh from backend to ensure consistency
          this.refreshWishlist();
        }),
        catchError(error => {
          console.error('Error adding to wishlist:', error);
          return throwError(() => error);
        })
      );
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, { responseType: 'text' })
      .pipe(
        tap(() => {
          // Refresh from backend to ensure consistency
          this.refreshWishlist();
        }),
        catchError(error => {
          console.error('Error removing from wishlist:', error);
          return throwError(() => error);
        })
      );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems.value.some(item => item.id === productId);
  }

  getWishlistCount(): number {
    return this.wishlistItems.value.length;
  }

  clearWishlist(): void {
    this.wishlistItems.next([]);
  }

  refreshWishlist(): void {
    this.loadWishlistFromBackend();
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SanitizerUtil } from '../sanitizer.util';
import { environment } from '../../environments/environment';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  createdDate?: string;
  createdByUsername?: string;
  imageUrl?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.apiUrl + '/api/products';

  constructor(private http: HttpClient) {}

  getAllProducts(
    page: number,
    size: number,
    search?: string,
    sortBy?: string
  ): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    if (sortBy) {
      params = params.set('sort', sortBy);
    }
    
    return this.http.get<Page<Product>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getMyProducts(): Observable<Product[]> {
    // Get current user from token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No authentication token'));
    }
    
    // For now, get all products and filter by current user
    return this.getAllProducts(0, 1000).pipe(
      map(response => {
        const currentUser = this.getCurrentUserFromToken(token);
        return response.content.filter(product => 
          product.createdByUsername === currentUser
        );
      })
    );
  }
  
  private getCurrentUserFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || '';
    } catch {
      return '';
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', SanitizerUtil.sanitizeForLog(error?.message || 'Unknown error'));
    return throwError(() => error);
  }
}

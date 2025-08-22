import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5050/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }

  getAllCarts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carts`);
  }

  getAllWishlists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wishlists`);
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/users`);
  }

  getProductStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/products`);
  }

  getOrderStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/orders`);
  }
}
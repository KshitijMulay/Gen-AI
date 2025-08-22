import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private tokenKey = 'jwtToken';
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Exclude /auth/login, /auth/register, and public product endpoints
    if (req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register') || 
        req.url.includes('/api/products') && req.method === 'GET') {
      return next.handle(req);
    }

    const token = localStorage.getItem(this.tokenKey);
    let requestToHandle = req;
    if (token) {
      requestToHandle = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(requestToHandle).pipe(
        catchError((err) => {
          if (err.status === 401) {
            localStorage.removeItem(this.tokenKey);
            this.router.navigate(['/login']);
          } else if (err.status === 403) {
            console.error('Access forbidden:', err.message || 'Insufficient permissions');
          } else if (err.status >= 500) {
            console.error('Server error:', err.message || 'Unknown server error');
          } else if (err.status === 0) {
            console.error('Network error:', 'Unable to connect to server');
          }
          return throwError(() => err);
        })
    );
  }
}

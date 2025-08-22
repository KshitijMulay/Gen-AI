import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from './notification.service';
import { SanitizerUtil } from '../sanitizer.util';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: any): void {
    console.error('Global error:', SanitizerUtil.sanitizeForLog(error));
    
    // Show user-friendly error message
    if (error?.status === 0) {
      this.notificationService.showError('Network error. Please check your connection.');
    } else if (error?.status >= 500) {
      this.notificationService.showError('Server error. Please try again later.');
    } else if (error?.status === 401) {
      this.notificationService.showError('Session expired. Please login again.');
    } else if (error?.status === 403) {
      this.notificationService.showError('Access denied.');
    } else {
      this.notificationService.showError('An unexpected error occurred.');
    }
  }
}
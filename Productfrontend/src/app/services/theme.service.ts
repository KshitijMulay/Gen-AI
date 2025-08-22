import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.isDarkMode.next(JSON.parse(savedTheme));
    }
  }

  toggleDarkMode() {
    const newMode = !this.isDarkMode.value;
    this.isDarkMode.next(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  }

  getCurrentTheme(): boolean {
    return this.isDarkMode.value;
  }
}
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(false);
  darkTheme$ = this.darkTheme.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      // Check for saved theme preference only in browser environment
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme) {
        this.darkTheme.next(JSON.parse(savedTheme));
      }
    }
  }

  toggleTheme() {
    const currentValue = this.darkTheme.value;
    this.darkTheme.next(!currentValue);
    
    if (this.isBrowser) {
      localStorage.setItem('darkTheme', JSON.stringify(!currentValue));
    }
  }

  isDarkTheme(): boolean {
    return this.darkTheme.value;
  }
} 
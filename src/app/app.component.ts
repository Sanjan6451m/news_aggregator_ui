import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NewsListComponent } from './components/news-list/news-list.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, NewsListComponent],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <div class="toolbar-content">
        <div class="logo-section">
          <mat-icon>article</mat-icon>
          <span>News Aggregator</span>
        </div>
        <button mat-icon-button (click)="toggleTheme()" aria-label="Toggle theme">
          <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>
    <app-news-list></app-news-list>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toolbar-content {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      span {
        font-size: 1.25rem;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    :host-context(.dark-theme) {
      background-color: #1a202c;
    }

    @media (max-width: 600px) {
      .toolbar-content {
        padding: 0 16px;
      }

      .logo-section span {
        font-size: 1.1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'news-aggregator-ui';
  isDarkTheme = false;

  constructor(private themeService: ThemeService) {
    this.themeService.darkTheme$.subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
} 
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NewsCardComponent } from '../news-card/news-card.component';
import { NewsService } from '../../services/news.service';
import { NewsArticle } from '../../models/news.interface';
import { ThemeService } from '../../services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    NewsCardComponent,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="news-container">
      <!-- Topic Filter -->
      <div class="filter-section" *ngIf="topics.length > 0">
        <mat-form-field appearance="fill">
          <mat-label>Filter by Topic</mat-label>
          <mat-select [(ngModel)]="selectedTopic" (selectionChange)="filterByTopic($event.value)">
            <mat-option value="all">All Topics</mat-option>
            <mat-option *ngFor="let topic of topics" [value]="topic">
              {{ topic }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="news-grid" *ngIf="!loading && !error; else loadingOrError">
        <app-news-card
          *ngFor="let article of filteredNews"
          [article]="article"
        ></app-news-card>
      </div>

      <ng-template #loadingOrError>
        <div class="center-content">
          <mat-spinner *ngIf="loading"></mat-spinner>
          <div *ngIf="error" class="error-message">
            <p>{{ error }}</p>
            <button (click)="loadNews()" class="retry-button">Retry</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .news-container {
      max-width: 1600px;
      margin: 24px auto;
      padding: 0 24px;
    }

    .filter-section {
      margin-bottom: 24px;
      
      mat-form-field {
        width: 100%;
        max-width: 300px;
      }
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      animation: fadeIn 0.3s ease-in;
    }

    .center-content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .error-message {
      text-align: center;
      color: #dc2626;
      
      p {
        margin-bottom: 16px;
        font-size: 1.1rem;
      }
    }

    .retry-button {
      padding: 8px 24px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #1d4ed8;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host-context(.dark-theme) {
      .filter-section {
        mat-form-field {
          color: #e2e8f0;
        }
      }
    }

    @media (max-width: 600px) {
      .news-container {
        padding: 0 16px;
        margin: 16px auto;
      }

      .news-grid {
        gap: 16px;
      }

      .filter-section {
        margin-bottom: 16px;
      }
    }
  `]
})
export class NewsListComponent implements OnInit, AfterViewInit {
  newsArticles: NewsArticle[] = [];
  filteredNews: NewsArticle[] = [];
  topics: string[] = [];
  selectedTopic: string = 'all';
  loading = true;
  error: string | null = null;
  isDarkTheme: boolean = false;
  private isBrowser: boolean;

  get allTopics(): string[] {
    return ['all', ...this.topics];
  }

  constructor(
    private newsService: NewsService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      this.themeService.darkTheme$.subscribe(isDark => {
        this.isDarkTheme = isDark;
        document.body.classList.toggle('dark-theme', isDark);
        this.cdr.detectChanges();
      });
    }
    await this.loadNews();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  }

  async loadNews() {
    this.loading = true;
    this.error = null;
    
    if (this.isBrowser) {
      console.log('Starting to load news...');
    }
    
    try {
      const response = await firstValueFrom(this.newsService.getNews());
      
      if (this.isBrowser) {
        console.log('Raw response:', response);
      }

      const articles = Array.isArray(response) ? response : [];
      
      if (articles.length === 0) {
        this.error = 'No news articles found. Please try again later.';
        return;
      }

      const validArticles = articles.filter(article => 
        article && 
        typeof article.title === 'string' &&
        typeof article.summary === 'string' &&
        typeof article.topic === 'string'
      );

      if (validArticles.length === 0) {
        this.error = 'Invalid article data received. Please try again later.';
        return;
      }

      this.newsArticles = validArticles;
      this.filteredNews = [...validArticles];
      this.topics = [...new Set(validArticles.map(article => article.topic))];
      
      if (this.isBrowser) {
        console.log('Processed articles:', this.newsArticles);
        console.log('Available topics:', this.topics);
      }
    } catch (error) {
      this.error = `Failed to load news articles: ${error instanceof Error ? error.message : 'Unknown error'}`;
      if (this.isBrowser) {
        console.error('Error loading news:', error);
      }
    } finally {
      this.loading = false;
      if (this.isBrowser) {
        this.cdr.detectChanges();
      }
    }
  }

  filterByTopic(topic: string): void {
    if (!topic) return;
    
    if (topic === 'all') {
      this.filteredNews = [...this.newsArticles];
      this.error = null;
    } else {
      this.filteredNews = this.newsArticles.filter(article => article.topic === topic);
      if (this.filteredNews.length === 0) {
        this.error = `No articles found for topic: ${topic}`;
      } else {
        this.error = null;
      }
    }

    if (this.isBrowser) {
      this.cdr.detectChanges();
    }
  }

  toggleTheme() {
    if (this.isBrowser) {
      this.themeService.toggleTheme();
      this.cdr.detectChanges();
    }
  }
} 
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
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, AfterViewInit {
  news: NewsArticle[] = [];
  filteredNews: NewsArticle[] = [];
  topics: string[] = [];
  selectedTopic: string = 'all';
  isLoading: boolean = false;
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
    try {
      this.isLoading = true;
      this.error = null;
      
      if (this.isBrowser) {
        console.log('Starting to load news...');
      }
      
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

      this.news = validArticles;
      this.filteredNews = [...validArticles];
      this.topics = [...new Set(validArticles.map(article => article.topic))];
      
      if (this.isBrowser) {
        console.log('Processed articles:', this.news);
        console.log('Available topics:', this.topics);
      }
    } catch (error) {
      this.error = `Failed to load news articles: ${error instanceof Error ? error.message : 'Unknown error'}`;
      if (this.isBrowser) {
        console.error('Error loading news:', error);
      }
    } finally {
      this.isLoading = false;
      if (this.isBrowser) {
        this.cdr.detectChanges();
      }
    }
  }

  filterByTopic(topic: string): void {
    if (!topic) return;
    
    if (topic === 'all') {
      this.filteredNews = [...this.news];
      this.error = null;
    } else {
      this.filteredNews = this.news.filter(article => article.topic === topic);
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
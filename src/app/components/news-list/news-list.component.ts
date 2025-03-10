import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  get allTopics(): string[] {
    return ['all', ...this.topics];
  }

  constructor(
    private newsService: NewsService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadNews();
    this.themeService.darkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      document.body.classList.toggle('dark-theme', isDark);
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    // Force change detection after view initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  loadNews() {
    this.isLoading = true;
    this.error = null;
    console.log('Starting to load news...');
    
    this.newsService.getNews().subscribe({
      next: (response) => {
        console.log('Raw response:', response);
        // Ensure we have an array of articles
        const articles = Array.isArray(response) ? response : [];
        
        if (articles.length === 0) {
          this.error = 'No news articles found. Please try again later.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // Validate article structure
        const validArticles = articles.filter(article => 
          article && 
          typeof article.title === 'string' &&
          typeof article.summary === 'string' &&
          typeof article.topic === 'string'
        );

        if (validArticles.length === 0) {
          this.error = 'Invalid article data received. Please try again later.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.news = validArticles;
        this.filteredNews = [...validArticles];
        this.topics = [...new Set(validArticles.map(article => article.topic))];
        console.log('Processed articles:', this.news);
        console.log('Available topics:', this.topics);
        this.isLoading = false;
        
        // Force change detection after data is loaded
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.error = `Failed to load news articles: ${error.message}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterByTopic(topic: string): void {
    if (!topic) return;
    
    if (topic === 'all') {
      this.filteredNews = [...this.news];
      this.error = null;
      this.cdr.detectChanges();
      return;
    }

    // Filter articles locally instead of making an API call
    this.filteredNews = this.news.filter(article => article.topic === topic);
    
    if (this.filteredNews.length === 0) {
      this.error = `No articles found for topic: ${topic}`;
    } else {
      this.error = null;
    }
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.cdr.detectChanges();
  }
} 
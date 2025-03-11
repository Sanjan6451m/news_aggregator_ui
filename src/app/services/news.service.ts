import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, of } from 'rxjs';
import { NewsArticle } from '../models/news.interface';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { StateKey, TransferState, makeStateKey } from '@angular/core';

const NEWS_KEY = makeStateKey<NewsArticle[]>('news');

interface NewsResponse {
  articles: NewsArticle[];
  totalArticles: number;
  currentPage: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'https://news-aggregator-api.vercel.app/api/news';
  private isBrowser: boolean;
  private platformId: Object;

  constructor(
    private http: HttpClient,
    @Inject(TransferState) private transferState: TransferState,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.platformId = platformId;
  }

  getNews(): Observable<NewsArticle[]> {
    // First, try to get the data from transfer state
    const existingNews = this.transferState.get(NEWS_KEY, null);
    
    // If we have data in transfer state and we're in the browser, use it
    if (this.isBrowser && existingNews) {
      return of(existingNews);
    }

    console.log('Fetching news from:', this.apiUrl);
    return this.http.get<NewsResponse>(this.apiUrl).pipe(
      tap(response => {
        console.log('Received news data:', response);
      }),
      map(response => {
        const articles = response.articles || [];
        // Store the data in transfer state if we're on the server
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(NEWS_KEY, articles);
        }
        return articles;
      }),
      catchError(this.handleError)
    );
  }

  getNewsByTopic(topic: string): Observable<NewsArticle[]> {
    if (!topic) {
      return of([]);
    }

    console.log('Fetching news for topic:', topic);
    return this.http.get<NewsResponse>(`${this.apiUrl}/topic/${topic}`).pipe(
      tap(response => {
        console.log('Received filtered news data:', response);
      }),
      map(response => response.articles || []),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('API Error:', errorMessage);
    
    // Return an empty array instead of throwing an error
    return of([]) as any;
  }
} 
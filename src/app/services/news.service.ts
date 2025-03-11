import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { NewsArticle } from '../models/news.interface';

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

  constructor(private http: HttpClient) { }

  getNews(): Observable<NewsArticle[]> {
    console.log('Fetching news from:', this.apiUrl);
    return this.http.get<NewsResponse>(this.apiUrl).pipe(
      tap(response => {
        console.log('Received news data:', response);
      }),
      map(response => response.articles),
      catchError(this.handleError)
    );
  }

  getNewsByTopic(topic: string): Observable<NewsArticle[]> {
    console.log('Fetching news for topic:', topic);
    return this.http.get<NewsResponse>(`${this.apiUrl}/topic/${topic}`).pipe(
      tap(response => {
        console.log('Received filtered news data:', response);
      }),
      map(response => response.articles),
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
    throw new Error(errorMessage);
  }
} 
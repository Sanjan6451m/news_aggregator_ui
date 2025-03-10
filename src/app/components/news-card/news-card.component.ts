import { Component, Input, OnInit } from '@angular/core';
import { NewsArticle } from '../../models/news-article.model';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent implements OnInit {
  @Input() article!: NewsArticle;
  defaultImageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=200&fit=crop&auto=format&q=80';

  get currentImageUrl(): string {
    return this.article.imageUrl || this.defaultImageUrl;
  }

  ngOnInit() {
    // Set initial image URL
    this.article.imageUrl = this.currentImageUrl;
  }

  getSentimentColor(score: number): string {
    if (score > 0) return 'primary';
    if (score < 0) return 'warn';
    return '';
  }

  getSentimentIcon(score: number): string {
    if (score > 0) return 'sentiment_very_satisfied';
    if (score < 0) return 'sentiment_very_dissatisfied';
    return 'sentiment_neutral';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImageUrl;
  }
} 
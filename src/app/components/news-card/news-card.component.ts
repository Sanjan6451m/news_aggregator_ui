import { Component, Input, OnInit } from '@angular/core';
import { NewsArticle } from '../../models/news.interface';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent implements OnInit {
  @Input() article!: NewsArticle;
  defaultImageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop';
  currentImageUrl: string = '';

  ngOnInit() {
    this.setInitialImage();
  }

  setInitialImage(): void {
    if (!this.article) {
      this.currentImageUrl = this.defaultImageUrl;
      return;
    }

    // Check if the article has a valid imageUrl
    if (this.article.imageUrl && this.isValidUrl(this.article.imageUrl)) {
      this.currentImageUrl = this.article.imageUrl;
    } else {
      this.currentImageUrl = this.defaultImageUrl;
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.defaultImageUrl) {
      console.log('Image load failed, using default image');
      img.src = this.defaultImageUrl;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getSentimentClass(score: number): string {
    if (score > 0.6) return 'positive';
    if (score >= 0.4 && score <= 0.6) return 'neutral';
    return 'negative';
  }
} 
export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  keyEntities?: string[];
  affectedStates?: string[];
  sentiment?: number;
} 
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  topic: string;
  summary: string;
  sentimentScore: number;
  keyEntities: string[];
  affectedStates: string[];
  publishedAt: string;
  createdAt: string;
  imageUrl: string;
} 
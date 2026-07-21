export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
}

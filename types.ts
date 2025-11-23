export interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  authorImage: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  readingTime: number;
  status: 'published' | 'draft';
  category: string;
  content?: string;
  metadata?: {
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
}

export interface NavigationProps {
  onNavigateHome: () => void;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

import { BlogPost } from '../types';

/**
 * Generate sitemap XML from blog posts
 */
export const generateSitemapXml = (posts: BlogPost[]): string => {
  const baseUrl = 'https://www.adnoxyglobal.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- All Blogs Page -->
  <url>
    <loc>${baseUrl}?view=all</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Blog Posts -->
${posts.map(post => {
  const postUrl = `${baseUrl}?post=${post.slug}`;
  const lastmod = post.updatedAt || post.publishedAt;
  const formattedDate = lastmod ? new Date(lastmod).toISOString().split('T')[0] : currentDate;
  
  return `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${post.coverImage ? `
    <image:image>
      <image:loc>${post.coverImage}</image:loc>
      <image:title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>` : ''}
  </url>`;
}).join('\n')}

</urlset>`;

  return xml;
};

/**
 * Save sitemap to public directory (for build process)
 */
export const saveSitemapToFile = (sitemapXml: string): void => {
  // This would be used in a Node.js build script
  // For browser, we'll use localStorage and provide download
  if (typeof window !== 'undefined') {
    localStorage.setItem('sitemap-xml', sitemapXml);
    localStorage.setItem('sitemap-generated-at', new Date().toISOString());
  }
};

/**
 * Get cached sitemap from localStorage
 */
export const getCachedSitemap = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sitemap-xml');
  }
  return null;
};

/**
 * Check if sitemap needs regeneration (older than 24 hours)
 */
export const shouldRegenerateSitemap = (): boolean => {
  if (typeof window !== 'undefined') {
    const generatedAt = localStorage.getItem('sitemap-generated-at');
    if (!generatedAt) return true;
    
    const generatedDate = new Date(generatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - generatedDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > 24;
  }
  return true;
};

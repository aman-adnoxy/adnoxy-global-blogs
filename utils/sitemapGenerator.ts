import { BlogPost } from '../types';

/**
 * Generate dynamic sitemap XML from blog posts (for manual download only)
 */
export const generateDynamicSitemapXml = (posts: BlogPost[]): string => {
  const baseUrl = 'https://www.adnoxyglobal.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Blog Posts (Dynamic) -->
${posts.map(post => {
  const postUrl = `${baseUrl}?post=${post.slug}`;
  const lastmod = post.updatedAt || post.publishedAt;
  const formattedDate = lastmod ? new Date(lastmod).toISOString().split('T')[0] : currentDate;
  const escapedTitle = post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  return `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${post.coverImage ? `
    <image:image>
      <image:loc>${post.coverImage}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>` : ''}
  </url>`;
}).join('\n')}

</urlset>`;

  return xml;
};

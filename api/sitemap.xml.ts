import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bcgdakzytmeiheoinwhs.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZ2Rha3p5dG1laWhlb2lud2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTIxMjYsImV4cCI6MjA2NDI2ODEyNn0.d6icINgXF8sNCDinGtr069iYggMpGm4nb0S2A-GdQ9U';

export default async function handler(req: any, res: any) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List all markdown files
    const { data: files, error } = await supabase.storage
      .from('blog-markdown')
      .list();

    if (error) throw error;

    const posts = [];
    
    // Fetch each markdown file to extract metadata
    for (const file of files.filter(f => f.name.endsWith('.md'))) {
      const { data, error: downloadError } = await supabase.storage
        .from('blog-markdown')
        .download(file.name);

      if (!downloadError && data) {
        const text = await data.text();
        const slug = file.name.replace('.md', '');
        
        // Extract frontmatter
        const titleMatch = text.match(/title:\s*['"]([^'"]+)['"]/);
        const dateMatch = text.match(/publishedAt:\s*['"]([^'"]+)['"]/);
        const updatedMatch = text.match(/updatedAt:\s*['"]([^'"]+)['"]/);
        const coverImageMatch = text.match(/coverImage:\s*['"]([^'"]+)['"]/);
        
        posts.push({
          slug,
          title: titleMatch?.[1] || slug,
          publishedAt: dateMatch?.[1] || new Date().toISOString(),
          updatedAt: updatedMatch?.[1],
          coverImage: coverImageMatch?.[1]
        });
      }
    }

    // Generate sitemap XML
    const baseUrl = 'https://www.adnoxyglobal.com';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${posts.map(post => {
  const postUrl = `${baseUrl}?post=${post.slug}`;
  const lastmod = post.updatedAt || post.publishedAt;
  const formattedDate = new Date(lastmod).toISOString().split('T')[0];
  const escapedTitle = (post.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
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

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}

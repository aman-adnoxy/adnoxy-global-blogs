import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY;

export default async function handler(req: any, res: any) {
  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
    
    // List all markdown files
    const listCommand = new ListObjectsV2Command({
      Bucket: 'blog-markdown',
    });
    const { Contents } = await s3.send(listCommand);
    const files = Contents || [];

    const posts = [];
    
    // Fetch each markdown file to extract metadata
    for (const file of files.filter(f => f.Key && f.Key.endsWith('.md'))) {
      const getCommand = new GetObjectCommand({
        Bucket: 'blog-markdown',
        Key: file.Key!,
      });
      
      try {
        const response = await s3.send(getCommand);
        if (response.Body) {
          const text = await response.Body.transformToString();
          const slug = file.Key!.replace('.md', '');
          
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
      } catch (downloadError) {
        console.error(`Error downloading ${file.Key}:`, downloadError);
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

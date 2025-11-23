// Script to generate sitemap.xml for production build
// Run this after building: node scripts/generate-sitemap.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files manually
const loadEnvFile = (filename) => {
  const envPath = path.join(__dirname, '..', filename);
  let url = '';
  let key = '';
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        
        const [envKey, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        
        if (envKey.trim() === 'VITE_SUPABASE_URL') {
          url = value.replace(/['"]/g, '');
        } else if (envKey.trim() === 'VITE_SUPABASE_ANON_KEY') {
          key = value.replace(/['"]/g, '');
        }
      }
    }
  } catch (error) {
    // Silently fail
  }
  
  return { url, key };
};

// Try .env.local first, then .env
let { url: supabaseUrl, key: supabaseKey } = loadEnvFile('.env.local');

if (!supabaseUrl || !supabaseKey) {
  const envData = loadEnvFile('.env');
  supabaseUrl = supabaseUrl || envData.url;
  supabaseKey = supabaseKey || envData.key;
}

// Fallback to process.env
supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL || '';
supabaseKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found');
  console.log('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const generateSitemap = async () => {
  try {
    console.log('🔄 Generating sitemap.xml...');
    console.log(`   Supabase URL: ${supabaseUrl}`);

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch all markdown files
    const { data: files, error } = await supabase
      .storage
      .from('blog-markdown')
      .list();

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    console.log(`   Found ${files.length} files in storage`);

    const posts = [];
    
    for (const file of files.filter(f => f.name.endsWith('.md'))) {
      const { data, error: downloadError } = await supabase
        .storage
        .from('blog-markdown')
        .download(file.name);

      if (!downloadError && data) {
        const text = await data.text();
        const slug = file.name.replace('.md', '');
        
        // Extract frontmatter metadata
        const titleMatch = text.match(/title:\s*['"]([^'"]+)['"]/);
        const dateMatch = text.match(/publishedAt:\s*['"]([^'"]+)['"]/);
        const updatedMatch = text.match(/updatedAt:\s*['"]([^'"]+)['"]/);
        const coverImageMatch = text.match(/coverImage:\s*['"]([^'"]+)['"]/);
        
        posts.push({
          slug,
          title: titleMatch ? titleMatch[1] : slug,
          publishedAt: dateMatch ? dateMatch[1] : new Date().toISOString(),
          updatedAt: updatedMatch ? updatedMatch[1] : null,
          coverImage: coverImageMatch ? coverImageMatch[1] : null
        });
        
        console.log(`   ✓ Processed: ${slug}`);
      }
    }

    // Generate sitemap XML with image support
    const baseUrl = 'https://www.adnoxyglobal.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
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
  const formattedDate = new Date(lastmod).toISOString().split('T')[0];
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

    // Write to public directory
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    
    console.log('');
    console.log('✅ Sitemap generated successfully!');
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Location: ${sitemapPath}`);
    console.log(`   Size: ${(xml.length / 1024).toFixed(2)} KB`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

generateSitemap();

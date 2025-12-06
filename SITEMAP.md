# Sitemap Architecture

Simple serverless function approach for dynamic sitemap generation.

## How It Works

`/sitemap.xml` → Vercel serverless function at `/api/sitemap.xml.ts`

The function:
1. Fetches all markdown files from Supabase Storage
2. Extracts metadata from frontmatter
3. Generates XML sitemap with all pages and blog posts
4. Caches for 1 hour (3600s)

## Benefits

✅ Simple - Single serverless function, no service workers or cache management
✅ Platform-agnostic - Works on Vercel, Netlify, or any serverless platform
✅ Always up-to-date - Fetches latest posts on each request
✅ Fast - Cached for 1 hour at CDN edge
✅ SEO optimized - Includes images, lastmod dates, priorities

## Testing

Local: `npm run dev` then visit `http://localhost:3000/sitemap.xml`
Production: `https://www.adnoxyglobal.com/sitemap.xml`

## Deployment

Works on any serverless platform that supports Node.js functions.

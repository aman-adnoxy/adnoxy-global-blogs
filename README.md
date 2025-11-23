# Adnoxy Blog

A modern, SEO-optimized blog platform built with React, TypeScript, and Vite. Features dynamic content management via Supabase, comprehensive search and filtering, and optimized for performance.

## 🚀 Features

- **Dynamic Content Management**: Blog posts stored in Supabase with markdown support
- **SEO Optimized**: Complete meta tags, Open Graph, Twitter Cards, and structured data
- **Search & Filter**: Real-time search with category filtering
- **Pagination**: Smart pagination with page number display
- **Social Sharing**: Share to Twitter, LinkedIn, Facebook, or copy link
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dynamic Sitemap**: Auto-generated XML sitemap for search engines
- **Featured Posts**: Random featured section on homepage
- **Top Picks**: Latest posts by category
- **Related Posts**: Smart recommendations based on category and tags

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account with configured storage buckets

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adnoxy-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
adnoxy-blog/
├── components/          # Reusable React components
│   ├── BlogCard.tsx
│   ├── FeaturedSection.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ScrollToTop.tsx
│   ├── Seo.tsx
│   └── Toast.tsx
├── pages/              # Page components
│   ├── AllBlogsPage.tsx
│   ├── BlogDetailPage.tsx
│   └── LandingPage.tsx
├── services/           # API services
│   └── blogService.ts
├── utils/              # Utility functions
│   ├── markdown.ts
│   └── sitemapGenerator.ts
├── lib/                # Third-party configurations
│   └── supabase.ts
├── public/             # Static assets
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/            # Build scripts
│   └── generate-sitemap.js
└── App.tsx             # Main application component
```

## 🎨 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **Backend**: Supabase (Storage & Database)
- **Markdown**: Marked.js with DOMPurify
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Sitemap
npm run generate-sitemap # Generate sitemap from Supabase
npm run build:full       # Build and generate sitemap
```

## 🗂️ Supabase Setup

### Required Storage Buckets

1. **blog-markdown**: Store markdown files
   - Public access
   - Allowed file types: `.md`

2. **blog-images**: Store blog images
   - Public access
   - Allowed file types: `.jpg`, `.jpeg`, `.png`, `.webp`

### Markdown File Format

```markdown
---
id: 1
slug: 'post-slug'
title: 'Post Title'
publishedAt: '2025-11-23'
updatedAt: '2025-11-23'
author: 'Author Name'
authorImage: 'https://example.com/author.jpg'
excerpt: 'Brief description'
coverImage: 'https://example.com/cover.jpg'
tags: ['tag1', 'tag2']
readingTime: 10
status: 'published'
category: 'Category Name'
metadata:
  keywords: ['keyword1', 'keyword2']
  ogImage: '/images/og-image.jpg'
  canonicalUrl: 'https://example.com/post'
---

# Your Content Here

Markdown content goes here...
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to Git**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables
   - Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 🔍 SEO Features

- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Structured Data**: JSON-LD for articles and blog
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Configured for search engine crawling
- **Canonical URLs**: Prevent duplicate content
- **Image Optimization**: Proper alt tags and metadata

## 🎯 Key Features Explained

### Search & Filter
- Real-time search across titles, excerpts, and tags
- Dynamic category filtering
- Results counter

### Pagination
- 12 posts per page on All Blogs page
- Smart page number display (1 ... 4 5 6 ... 10)
- Previous/Next navigation
- Smooth scroll to top

### Social Sharing
- Twitter/X integration
- LinkedIn sharing
- Facebook sharing
- Copy link with toast notification

### Dynamic Sitemap
- Generates on app load
- Includes all blog posts
- Image metadata for SEO
- Browser console utilities:
  - `window.downloadSitemap()` - Download sitemap
  - `window.viewSitemap()` - View in console

## 🐛 Troubleshooting

### Build Issues

**Problem**: Build fails with TypeScript errors
```bash
# Solution: Check TypeScript configuration
npm run build
```

**Problem**: Environment variables not loading
```bash
# Solution: Ensure .env file exists and variables are prefixed with VITE_
```

### Runtime Issues

**Problem**: Posts not loading
- Check Supabase credentials
- Verify bucket names match configuration
- Check browser console for errors

**Problem**: Images not displaying
- Verify image URLs are correct
- Check Supabase storage permissions
- Ensure images are in correct bucket

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [SEO Guide](./SEO-GUIDE.md)
- [Sitemap Documentation](./SITEMAP-README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review browser console for errors
3. Verify environment variables
4. Check Supabase configuration

## 🎉 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Made with ❤️ for Adnoxy**

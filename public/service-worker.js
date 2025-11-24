// Service Worker for dynamic sitemap generation
const VERSION = 'v3';
const CACHE_NAME = `sitemap-cache-${VERSION}`;
const SITEMAP_CACHE_DURATION = 3600000; // 1 hour in milliseconds

self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('sitemap-cache-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept sitemap-dynamic.xml requests
  if (url.pathname === '/sitemap-dynamic.xml') {
    event.respondWith(handleDynamicSitemap(event.request));
  }
});

async function handleDynamicSitemap(request) {
  try {
    // Check cache first
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedDate = cachedResponse.headers.get('X-Generated-At');
      if (cachedDate) {
        const age = Date.now() - new Date(cachedDate).getTime();
        if (age < SITEMAP_CACHE_DURATION) {
          console.log('[SW] Serving cached sitemap');
          return cachedResponse;
        }
      }
    }
    
    // Generate new sitemap
    console.log('[SW] Generating new sitemap');
    const sitemapXml = await generateSitemap();
    
    const response = new Response(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'X-Generated-At': new Date().toISOString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
    // Cache the response
    await cache.put(request, response.clone());
    
    return response;
  } catch (error) {
    console.error('[SW] Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

async function generateSitemap() {
  try {
    // Get Supabase credentials from IndexedDB (stored by main app)
    const config = await getConfigFromIndexedDB();
    
    if (!config || !config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase configuration not found');
    }
    
    // Fetch posts from Supabase Storage - List files
    const listUrl = `${config.supabaseUrl}/storage/v1/object/list/blog-markdown`;
    const response = await fetch(listUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.supabaseKey}`,
        'apikey': config.supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prefix: '',
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SW] List files error:', response.status, errorText);
      throw new Error('Failed to fetch posts');
    }
    
    const files = await response.json();
    const posts = [];
    const baseUrl = 'https://www.adnoxyglobal.com';
    
    // Fetch each markdown file
    for (const file of files.filter(f => f.name && f.name.endsWith('.md'))) {
      try {
        const downloadUrl = `${config.supabaseUrl}/storage/v1/object/blog-markdown/${file.name}`;
        const fileResponse = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${config.supabaseKey}`,
            'apikey': config.supabaseKey
          }
        });
        
        if (fileResponse.ok) {
          const text = await fileResponse.text();
          const slug = file.name.replace('.md', '');
          
          // Extract frontmatter
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
        }
      } catch (err) {
        console.error(`[SW] Error fetching ${file.name}:`, err);
      }
    }
    
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Blog Posts (Dynamic - ${posts.length} posts) -->
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
    
    return xml;
  } catch (error) {
    console.error('[SW] Error in generateSitemap:', error);
    throw error;
  }
}

async function getConfigFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('adnoxy-blog-config', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['config'], 'readonly');
      const store = transaction.objectStore('config');
      const getRequest = store.get('supabase');
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }
    };
  });
}

/**
 * Service Worker Manager
 * Handles registration and configuration for dynamic sitemap generation
 */

export async function initServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister old service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered for dynamic sitemap');
      
      // Force update
      await registration.update();
      
      // Update service worker if needed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Service Worker updated');
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export function storeSupabaseConfig(): void {
  // Use hardcoded values from lib/supabase.ts
  const supabaseUrl = 'https://bcgdakzytmeiheoinwhs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZ2Rha3p5dG1laWhlb2lud2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTIxMjYsImV4cCI6MjA2NDI2ODEyNn0.d6icINgXF8sNCDinGtr069iYggMpGm4nb0S2A-GdQ9U';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration not found');
    return;
  }
  
  // Store in IndexedDB for service worker access
  const request = indexedDB.open('adnoxy-blog-config', 1);
  
  request.onupgradeneeded = (event: any) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('config')) {
      db.createObjectStore('config');
    }
  };
  
  request.onsuccess = (event: any) => {
    const db = event.target.result;
    const transaction = db.transaction(['config'], 'readwrite');
    const store = transaction.objectStore('config');
    
    store.put({
      supabaseUrl,
      supabaseKey
    }, 'supabase');
    
    transaction.oncomplete = () => {
      console.log('✅ Supabase config stored for service worker');
    };
  };
  
  request.onerror = (error: any) => {
    console.error('Error storing Supabase config:', error);
  };
};

export async function clearSitemapCache(): Promise<void> {
  if ('caches' in window) {
    await caches.delete('sitemap-cache-v1');
    console.log('✅ Sitemap cache cleared');
  }
};

import React, { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  author,
  publishedDate,
  modifiedDate
}) => {
  const siteName = 'Adnoxy Blogs';

  useEffect(() => {
    // Update Title
    document.title = `${title} | ${siteName}`;

    // Helper to update or create meta tags
    const updateMeta = (attribute: string, attributeValue: string, content: string) => {
      let element = document.head.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('name', 'description', description);
    if (keywords && keywords.length > 0) {
      updateMeta('name', 'keywords', keywords.join(', '));
    }
    if (author) {
      updateMeta('name', 'author', author);
    }

    // Open Graph
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:site_name', siteName);
    if (image) updateMeta('property', 'og:image', image);
    if (url) updateMeta('property', 'og:url', url);
    if (publishedDate) updateMeta('property', 'article:published_time', publishedDate);
    if (modifiedDate) updateMeta('property', 'article:modified_time', modifiedDate);
    if (author) updateMeta('property', 'article:author', author);

    // Twitter
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    if (image) updateMeta('name', 'twitter:image', image);

    // Canonical Link
    let link = document.head.querySelector('link[rel="canonical"]');
    if (url) {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }

    // Add structured data for articles
    if (type === 'article') {
      let script = document.head.querySelector('script[data-type="article-schema"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-type', 'article-schema');
        document.head.appendChild(script);
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": image || '',
        "author": {
          "@type": "Person",
          "name": author || 'Adnoxy Editorial'
        },
        "publisher": {
          "@type": "Organization",
          "name": "Adnoxy",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.adnoxy.com/logo.png"
          }
        },
        "datePublished": publishedDate || new Date().toISOString(),
        "dateModified": modifiedDate || publishedDate || new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url || window.location.href
        }
      };
      
      script.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, image, url, type, author, publishedDate, modifiedDate]);

  return null;
};
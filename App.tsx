import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AllBlogsPage } from './pages/AllBlogsPage';
import { ScrollToTop } from './components/ScrollToTop';
import { BlogPost } from './types';
import { BlogService } from './services/blogService';
import { generateSitemapXml, saveSitemapToFile } from './utils/sitemapGenerator';

type ViewType = 'home' | 'post' | 'all-blogs';

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await BlogService.getAllPosts();
      setPosts(data);
      setLoading(false);
      
      // Generate sitemap immediately after fetching posts
      if (data.length > 0) {
        try {
          const sitemapXml = generateSitemapXml(data);
          saveSitemapToFile(sitemapXml);
        } catch (error) {
          console.error('Error generating sitemap:', error);
        }
      }
    };

    fetchPosts();
  }, []);

  // Handle URL changes and Direct Links (Basic Routing)
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');
    const view = params.get('view');

    if (view === 'all') {
      setCurrentView('all-blogs');
      setSelectedPost(null);
    } else if (postSlug) {
      const foundPost = posts.find(p => p.slug === postSlug);
      if (foundPost) {
        setSelectedPost(foundPost);
        setCurrentView('post');
      }
    } else {
      setSelectedPost(null);
      setCurrentView('home');
    }
  }, [loading, posts]);

  // Make sitemap utilities available globally
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const sitemapXml = generateSitemapXml(posts);
      
      // Make it available globally for manual download
      (window as any).downloadSitemap = () => {
        const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.xml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };
      
    }
  }, [loading, posts]);

  const handleNavigateHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setCurrentView('home');
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  const handleNavigateToPost = (post: BlogPost) => {
    const newUrl = `${window.location.pathname}?post=${post.slug}`;
    window.history.pushState({ slug: post.slug }, '', newUrl);
    setCurrentView('post');
    setSelectedPost(post);
    window.scrollTo(0, 0);
  };

  const handleNavigateToAllBlogs = () => {
    const newUrl = `${window.location.pathname}?view=all`;
    window.history.pushState({ view: 'all' }, '', newUrl);
    setCurrentView('all-blogs');
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const postSlug = params.get('post');
      const view = params.get('view');

      if (view === 'all') {
        setCurrentView('all-blogs');
        setSelectedPost(null);
      } else if (postSlug) {
        const found = posts.find(p => p.slug === postSlug);
        if (found) {
          setSelectedPost(found);
          setCurrentView('post');
        }
      } else {
        setSelectedPost(null);
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-brand-accent selection:text-brand-black flex flex-col">
      <Header onNavigateHome={handleNavigateHome} />
      
      <main className="flex-grow">
        {currentView === 'post' && selectedPost ? (
          <BlogDetailPage 
            post={selectedPost} 
            allPosts={posts}
            onNavigateToPost={handleNavigateToPost}
            onBack={handleNavigateHome} 
          />
        ) : currentView === 'all-blogs' ? (
          <AllBlogsPage 
            posts={posts}
            onNavigateToPost={handleNavigateToPost}
            onBack={handleNavigateHome}
          />
        ) : (
          <LandingPage 
            posts={posts} 
            isLoading={loading}
            onNavigateToPost={handleNavigateToPost}
            onNavigateToAllBlogs={handleNavigateToAllBlogs}
          />
        )}
      </main>

      <Footer posts={posts} />
      <ScrollToTop />
    </div>
  );
};

export default App;
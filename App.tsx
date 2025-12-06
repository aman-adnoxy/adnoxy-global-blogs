import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AllBlogsPage } from './pages/AllBlogsPage';
import { ScrollToTop } from './components/ScrollToTop';
import { BlogPost } from './types';
import { BlogService } from './services/blogService';

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

  const handleNavigateToAllBlogs = (searchQuery?: string) => {
    const params = new URLSearchParams();
    params.set('view', 'all');
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ view: 'all', search: searchQuery }, '', newUrl);
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
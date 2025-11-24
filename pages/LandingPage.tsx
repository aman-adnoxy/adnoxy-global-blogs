import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { BlogPost } from '../types';
import { BlogCard } from '../components/BlogCard';
import { FeaturedSection } from '../components/FeaturedSection';
import { Seo } from '../components/Seo';

interface LandingPageProps {
  posts: BlogPost[];
  isLoading: boolean;
  onNavigateToPost: (post: BlogPost) => void;
  onNavigateToAllBlogs: (searchQuery?: string) => void;
}

const ITEMS_PER_PAGE = 6;

export const LandingPage: React.FC<LandingPageProps> = ({ posts, isLoading, onNavigateToPost, onNavigateToAllBlogs }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToAllBlogs(searchQuery);
    }
  };

  // Extract unique categories from posts dynamically
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    posts.forEach(post => {
      if (post.category) {
        uniqueCategories.add(post.category);
      }
    });
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, [posts]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery]);

  // Featured Section: Random 4 posts (1 main + 3 side)
  const featuredPosts = useMemo(() => {
    if (posts.length === 0) return { main: null, side: [] };
    
    // Get random posts for featured section
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    return {
      main: shuffled[0] || null,
      side: shuffled.slice(1, 4)
    };
  }, [posts]);

  // Filter logic for search and remaining posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post: BlogPost) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Top Picks: Latest 3 posts from filtered results (category + search)
  const topPicks = useMemo(() => {
    return filteredPosts.slice(0, 3);
  }, [filteredPosts]);

  // More Articles: Next 3 posts after Top Picks (positions 3-6)
  const moreArticles = useMemo(() => {
    return filteredPosts.slice(3, 6);
  }, [filteredPosts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Seo 
        title="Home"
        description="Discover expert insights, tips, and industry trends on out-of-home advertising, billboard marketing, digital lead conversion, and business strategy. Stay ahead with Adnoxy's comprehensive blog."
        keywords={['OOH advertising', 'billboard marketing', 'outdoor advertising', 'digital marketing', 'lead conversion', 'marketing strategy', 'advertising trends', 'business insights']}
        url="https://www.adnoxy.com/blog"
        type="website"
      />

      {/* Hero Section */}
      <section className="pt-24 md:pt-28 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
           <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Our Blogs</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
         Insights That Move Markets,<br />
          <span className="text-gray-400">Explore Our Blog</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8 md:mb-10 text-base md:text-lg px-4">
          Fresh insights, bold ideas, and data-backed perspectives shaping the future of marketing and offline media.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 md:pl-10 pr-20 md:pr-24 py-2.5 md:py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent text-sm shadow-sm transition-shadow"
                placeholder="Search for Blogs..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-2 md:pr-3 flex items-center"
              >
                <span className="bg-gray-900 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors">
                  Search
                </span>
              </button>
            </form>
            <button
              onClick={() => onNavigateToAllBlogs()}
              className="px-5 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap"
            >
              View All
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 px-2">
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Top Picks Section - Latest from Selected Category */}
      {topPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-0">
          <div className="text-center mb-6 md:mb-8">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Top Picks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {topPicks.map((post: BlogPost) => (
              <BlogCard key={`top-pick-${post.id}`} post={post} onClick={onNavigateToPost} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Section - Random Posts */}
      {featuredPosts.main && (
        <FeaturedSection 
          mainPost={featuredPosts.main} 
          sidePosts={featuredPosts.side} 
          onPostClick={onNavigateToPost} 
        />
      )}

      {/* More Articles Section */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 md:py-20 text-gray-500 px-4">
          <p className="text-lg md:text-xl">No blogs found matching your criteria.</p>
        </div>
      ) : moreArticles.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <h3 className="font-heading text-xl md:text-2xl font-bold mb-6 md:mb-8">More Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {moreArticles.map((post: BlogPost, index: number) => (
              <BlogCard key={`more-${post.id}-${index}`} post={post} onClick={onNavigateToPost} />
            ))}
          </div>
          
          {filteredPosts.length > 6 && (
            <div className="mt-8 md:mt-12 flex justify-center gap-4">
              <button 
                onClick={() => onNavigateToAllBlogs()}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
              >
                View All Articles ({filteredPosts.length})
              </button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};

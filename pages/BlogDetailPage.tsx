import React, { useEffect, useMemo, useState } from 'react';
import { BlogPost } from '../types';
import { ArrowLeft, Twitter, Linkedin, Facebook, Link as LinkIcon, Clock, Calendar } from 'lucide-react';
import { Seo } from '../components/Seo';
import { BlogCard } from '../components/BlogCard';
import { Toast } from '../components/Toast';

interface BlogDetailPageProps {
  post: BlogPost;
  allPosts?: BlogPost[];
  onNavigateToPost?: (post: BlogPost) => void;
  onBack: () => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post, allPosts = [], onNavigateToPost, onBack }) => {
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  // Calculate Related Posts
  const relatedPosts = useMemo(() => {
    if (!allPosts.length) return [];
    
    return allPosts
      .filter(p => p.id !== post.id) // Exclude current
      .map(p => {
        // Simple relevance score: matches category = 2 points, matches tag = 1 point per tag
        let score = 0;
        if (p.category === post.category) score += 2;
        const sharedTags = p.tags.filter(tag => post.tags.includes(tag));
        score += sharedTags.length;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 3); // Take top 3
  }, [post, allPosts]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Sharing functions
  const handleShareTwitter = () => {
    const text = encodeURIComponent(post.title);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowToast(true);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <Seo 
        title={post.title}
        description={post.excerpt}
        keywords={post.metadata?.keywords || post.tags}
        image={post.metadata?.ogImage || post.coverImage}
        url={post.metadata?.canonicalUrl || currentUrl}
        type="article"
        author={post.author}
        publishedDate={post.publishedAt}
        modifiedDate={post.updatedAt}
      />

      {/* Back to Blog Button - Top Left */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors group"
        >
          <div className="bg-black text-white p-2 rounded-full group-hover:bg-blue-600 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Blog
        </button>
      </div>

      {/* Meta Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-12">
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-gray-500 tracking-widest uppercase mb-8">
            <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-blue-600">{post.category}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{post.readingTime} Min Read</span>
            </div>
        </div>
        
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {post.excerpt}
        </p>
      </div>

      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="relative aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl">
            <img 
                src={post.coverImage || null} 
                alt={post.title} 
                className="w-full h-full object-cover"
            />
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 pb-24 border-b border-gray-100 mb-16">
        
        {/* Sidebar (Left) - Socials & sticky */}
        <div className="lg:w-1/6 lg:relative">
             <div className="sticky top-32 flex flex-row lg:flex-col items-center lg:items-start gap-6">
                 <p className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Share</p>
                 <button 
                   onClick={handleShareTwitter}
                   className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all hover:scale-110"
                   title="Share on Twitter"
                 >
                     <Twitter size={18} />
                 </button>
                 <button 
                   onClick={handleShareLinkedIn}
                   className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-[#0077b5] hover:text-white transition-all hover:scale-110"
                   title="Share on LinkedIn"
                 >
                     <Linkedin size={18} />
                 </button>
                 <button 
                   onClick={handleShareFacebook}
                   className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-[#1877f2] hover:text-white transition-all hover:scale-110"
                   title="Share on Facebook"
                 >
                     <Facebook size={18} />
                 </button>
                 <button 
                   onClick={handleCopyUrl}
                   className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 transition-all hover:scale-110"
                   title="Copy link"
                 >
                     <LinkIcon size={18} />
                 </button>
             </div>
        </div>

        {/* Main Content (Center/Right) */}
        <div className="lg:w-2/3">
            {/* Author Block Top */}
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                <img 
                    src={post.authorImage || null} 
                    alt={post.author} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div>
                    <p className="text-sm font-bold text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Dynamic Content Rendering */}
            <div 
              className="
                prose prose-lg max-w-none 
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900 
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                prose-ul:list-disc prose-ul:ml-4 prose-ul:text-gray-600 prose-ul:mb-6
                prose-ol:list-decimal prose-ol:ml-4 prose-ol:text-gray-600 prose-ol:mb-6
                prose-li:marker:text-gray-300 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                prose-strong:text-gray-900
              "
              dangerouslySetInnerHTML={{ __html: post.content || '' }} 
            />

            {/* Tags Bottom */}
            <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-4">Tags:</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-heading text-3xl font-bold text-gray-900 mb-12">Read Next</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedPosts.map(p => (
                        <BlogCard 
                            key={p.id} 
                            post={p} 
                            onClick={(clickedPost) => {
                                if (onNavigateToPost) onNavigateToPost(clickedPost);
                                window.scrollTo(0,0);
                            }} 
                        />
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Toast Notification */}
      <Toast 
        message="Link copied to clipboard!" 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

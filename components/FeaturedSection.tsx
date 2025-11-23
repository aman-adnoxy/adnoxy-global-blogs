import React from 'react';
import { BlogPost } from '../types';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface FeaturedSectionProps {
  mainPost: BlogPost;
  sidePosts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ mainPost, sidePosts, onPostClick }) => {
  return (
    <section className="py-20 bg-gray-50/50 rounded-[3rem] my-12 px-4 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12">
            <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Featured Blogs</p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">Dive into Our Top Blogs</h2>
            </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Large Card - Left */}
          <div 
            className="lg:w-1/2 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            onClick={() => onPostClick(mainPost)}
          >
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
              <img 
                src={mainPost.coverImage || null} 
                alt={mainPost.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                 13 09
              </div>
            </div>
            <div className="p-2 md:p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{mainPost.category}</span>
                    <span className="text-xs text-gray-400">{mainPost.readingTime} Min Read</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{mainPost.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6">{mainPost.excerpt}</p>
                
                <div className="mt-auto flex items-center gap-3">
                    <img src={mainPost.authorImage} alt={mainPost.author} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">{mainPost.author}</span>
                </div>
            </div>
          </div>

          {/* Side List - Right */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {sidePosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onPostClick(post)}
                className="group flex flex-col sm:flex-row items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
              >
                <div className="w-full sm:w-40 h-32 sm:h-full rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={post.coverImage || null} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div className="flex-grow p-4 flex flex-col justify-between h-full w-full">
                   <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-semibold text-gray-500">{post.category}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-xs text-gray-400">{post.readingTime} Min Read</span>
                        </div>
                        <h4 className="font-heading font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                        </h4>
                   </div>
                   <div className="flex justify-end mt-2">
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                            <ArrowRight size={14} />
                        </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

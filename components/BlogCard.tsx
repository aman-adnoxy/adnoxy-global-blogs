import React from 'react';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  onClick: (post: BlogPost) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={() => onClick(post)}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={post.coverImage || null} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900">
          {post.category}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
          {post.excerpt}
        </p>
        
        <div className="flex items-center mt-auto pt-4 border-t border-gray-50">
          <img 
            src={post.authorImage || null} 
            alt={post.author} 
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">{post.author}</p>
            <p className="text-xs text-gray-400">{post.readingTime} Min Read</p>
          </div>
        </div>
      </div>
    </div>
  );
};

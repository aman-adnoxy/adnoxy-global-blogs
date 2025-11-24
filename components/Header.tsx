import React from 'react';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={onNavigateHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/adnoxy-blogs.png" 
                alt="Adnoxy Blog" 
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-bold text-gray-900">
                Adnoxy Blogs
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={onNavigateHome}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </button>
            <a 
              href="https://www.adnoxy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Visit Adnoxy
              <ExternalLink size={16} />
            </a>
          </nav>

          {/* CTA Button - Show on all screens */}
          <div className="block">
            <a 
              href="https://www.adnoxy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 md:gap-2 bg-gray-900 text-white px-3 py-2 md:px-6 md:py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-gray-800 transition-all shadow-md"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Visit</span>
              <ExternalLink size={14} className="md:w-4 md:h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
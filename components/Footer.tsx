import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { BlogPost } from '../types';
import { BlogService } from '../services/blogService';

interface FooterProps {
  posts?: BlogPost[];
}

export const Footer: React.FC<FooterProps> = ({ posts }) => {
  
  const handleDownloadSitemap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!posts) return;
    
    const xmlContent = BlogService.generateSitemapXml(posts);
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/adnoxy-blogs.png" 
                alt="Adnoxy Blog" 
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-bold text-gray-900">
                Adnoxy Blogs
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Expert insights on OOH advertising, billboard marketing, and business strategy. Built for brands that think, not guess.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.adnoxy.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                >
                  Adnoxy Home
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.adnoxy.com/about" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                >
                  About Us
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.adnoxy.com/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
                >
                  Contact
                  <ExternalLink size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; 2025 Adnoxy. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 mt-4 md:mt-0 justify-center">
            <a 
              href="https://www.adnoxy.com/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="https://www.adnoxy.com/terms-conditions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
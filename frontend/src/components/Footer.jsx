/**
 * Footer Component
 * Application footer with links and info
 */
import { Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by Rabbitt AI Team © {currentYear}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/api-docs"
              target="_blank"
              className="text-sm text-gray-500 hover:text-primary-600 
                         flex items-center gap-1 transition-colors"
            >
              API Documentation
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <span className="text-gray-300">|</span>
            
            <span className="text-sm text-gray-400">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

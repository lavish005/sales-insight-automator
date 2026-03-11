/**
 * Header Component
 * Application header with logo and navigation
 */
import { BarChart3, Github, FileText } from 'lucide-react';

const Header = () => {
  console.log('🔧 Header component rendered');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">
                Sales Insight Automator
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Powered by Rabbitt AI
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 
                         hover:text-primary-600 hover:bg-primary-50 rounded-lg 
                         transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">API Docs</span>
            </a>
            
            <a
              href="https://github.com/yourusername/sales-insight-automator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 
                         hover:text-primary-600 hover:bg-primary-50 rounded-lg 
                         transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

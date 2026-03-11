/**
 * SummaryPreview Component
 * Displays the AI-generated summary
 */
import { FileText, Copy, Download, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const SummaryPreview = ({ summary }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      console.log('📋 Summary copied to clipboard');
      toast.success('Summary copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('❌ Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-summary-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('📥 Summary downloaded');
      toast.success('Summary downloaded!');
    } catch (error) {
      console.error('❌ Failed to download:', error);
      toast.error('Failed to download summary');
    }
  };

  if (!summary) return null;

  // Convert markdown-like formatting to simple HTML
  const formatSummary = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900">$1</h1>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Generated Summary
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
                       flex items-center gap-2 text-sm text-gray-600"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors
                       flex items-center gap-2 text-sm text-gray-600"
            title="Download as text file"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 
                      max-h-[400px] overflow-y-auto">
        <div 
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: formatSummary(summary) }}
        />
      </div>
    </div>
  );
};

export default SummaryPreview;

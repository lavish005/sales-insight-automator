/**
 * Main App Component
 * Sales Insight Automator - Single Page Application
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Send, RefreshCw } from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import EmailInput from './components/EmailInput';
import StatusIndicator from './components/StatusIndicator';
import SummaryPreview from './components/SummaryPreview';
import { uploadFile, checkHealth } from './services/api';

function App() {
  // State management
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, sending, success, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [apiHealthy, setApiHealthy] = useState(null);

  // Check API health on mount
  useEffect(() => {
    console.log('🚀 App mounted - checking API health');
    
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        console.log('✅ API Health:', health);
        setApiHealthy(true);
        
        if (health.services.ai !== 'configured') {
          toast('AI service not configured - summaries may not work', {
            icon: '⚠️',
            duration: 5000
          });
        }
      } catch (error) {
        console.error('❌ API Health check failed:', error);
        setApiHealthy(false);
        toast.error('Unable to connect to backend API');
      }
    };

    checkApiHealth();
  }, []);

  // Form validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = file && email && emailRegex.test(email);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    console.log('📁 File selected:', selectedFile?.name);
    setFile(selectedFile);
    setStatus('idle');
    setSummary('');
    setMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      console.warn('⚠️ Form validation failed');
      toast.error('Please provide a valid file and email address');
      return;
    }

    console.log('📤 Starting upload process', {
      file: file.name,
      email
    });

    try {
      // Reset state
      setStatus('uploading');
      setProgress(0);
      setSummary('');
      setMessage('');

      // Upload and process
      const result = await uploadFile(file, email, (uploadProgress) => {
        setProgress(uploadProgress);
        if (uploadProgress === 100) {
          setStatus('processing');
        }
      });

      console.log('✅ Upload result:', result);

      if (result.success) {
        setStatus('success');
        setSummary(result.summary);
        setMessage(result.message);
        
        if (result.emailSent) {
          toast.success('Summary sent to your email!', {
            icon: '📧',
            duration: 5000
          });
        } else {
          toast('Summary generated but email delivery failed', {
            icon: '⚠️',
            duration: 5000
          });
        }

        console.log('📊 Processing stats:', result.stats);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || error.message);
      toast.error(error.response?.data?.error || 'Failed to process file');
    }
  };

  // Reset form
  const handleReset = () => {
    console.log('🔄 Resetting form');
    setFile(null);
    setEmail('');
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setSummary('');
  };

  const isProcessing = ['uploading', 'processing', 'sending'].includes(status);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-primary-50/30">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 
                          rounded-full text-primary-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Sales Analysis</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Transform Your Sales Data Into
            <span className="text-gradient"> Actionable Insights</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your sales data, and our AI will generate a professional executive 
            summary delivered straight to your inbox.
          </p>
        </div>

        {/* API Status Warning */}
        {apiHealthy === false && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl 
                          flex items-center gap-3 text-red-700">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium">Backend API Unavailable</p>
              <p className="text-sm">Please ensure the backend server is running on port 5000</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <FileUpload 
              onFileSelect={handleFileSelect}
              selectedFile={file}
              disabled={isProcessing}
            />

            {/* Email Input */}
            <EmailInput
              value={email}
              onChange={setEmail}
              disabled={isProcessing}
            />

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!isFormValid || isProcessing}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Generate & Send Summary</span>
                  </>
                )}
              </button>

              {(status === 'success' || status === 'error') && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  Start Over
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Status Indicator */}
        {status !== 'idle' && (
          <div className="mb-6">
            <StatusIndicator 
              status={status}
              progress={progress}
              message={message}
            />
          </div>
        )}

        {/* Summary Preview */}
        {summary && (
          <SummaryPreview summary={summary} />
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center 
                            justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Smart Analysis</h3>
            <p className="text-sm text-gray-600">
              AI analyzes your data to extract key metrics and trends
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center 
                            justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Instant Delivery</h3>
            <p className="text-sm text-gray-600">
              Professional summary delivered directly to your inbox
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center 
                            justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">
              Your data is processed securely and never stored
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

/**
 * API Service
 * Handles all API communications with the backend
 */
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60 second timeout for file uploads
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request config:', { 
      baseURL: config.baseURL,
      timeout: config.timeout 
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * Check API health status
 */
export const checkHealth = async () => {
  console.log('🏥 Checking API health...');
  const response = await api.get('/health');
  return response.data;
};

/**
 * Upload file and generate summary
 * @param {File} file - The file to upload
 * @param {string} email - Recipient email address
 * @param {function} onProgress - Progress callback
 */
export const uploadFile = async (file, email, onProgress) => {
  console.log('📁 Uploading file:', {
    name: file.name,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    type: file.type,
    email
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`📊 Upload progress: ${progress}%`);
      if (onProgress) onProgress(progress);
    }
  });

  return response.data;
};

/**
 * Preview file data without generating summary
 * @param {File} file - The file to preview
 */
export const previewFile = async (file) => {
  console.log('👁️ Previewing file:', file.name);

  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export default api;

/**
 * FileUpload Component
 * Drag-and-drop file upload with preview
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, selectedFile, disabled }) => {
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log('📂 Files dropped:', {
      accepted: acceptedFiles.length,
      rejected: rejectedFiles.length
    });

    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      console.error('❌ File rejected:', rejection.errors);
      
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a CSV or Excel file.');
      } else {
        setError(rejection.errors[0]?.message || 'File rejected');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('✅ File accepted:', {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type
      });
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    console.log('🗑️ File removed');
    onFileSelect(null);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          dropzone
          ${isDragActive ? 'dropzone-active' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFile ? 'border-green-400 bg-green-50/50' : ''}
          flex flex-col items-center justify-center min-h-[200px]
        `}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <p className="text-lg font-semibold text-gray-800">
                {selectedFile.name}
              </p>
              {!disabled && (
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
            
            {!disabled && (
              <p className="text-xs text-gray-400 mt-2">
                Click or drag to replace
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
              ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}
              transition-colors
            `}>
              <Upload className={`
                w-8 h-8 
                ${isDragActive ? 'text-primary-600' : 'text-gray-400'}
                transition-colors
              `} />
            </div>
            
            <p className="text-lg font-medium text-gray-700 mb-1">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your sales data'}
            </p>
            
            <p className="text-sm text-gray-500 mb-3">
              or click to browse
            </p>
            
            <p className="text-xs text-gray-400">
              Supports CSV, XLS, XLSX (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

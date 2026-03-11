/**
 * EmailInput Component
 * Email input with validation
 */
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const EmailInput = ({ value, onChange, disabled }) => {
  const [isValid, setIsValid] = useState(null);
  const [touched, setTouched] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (value) {
      const valid = emailRegex.test(value);
      setIsValid(valid);
      console.log(`📧 Email validation: ${value} - ${valid ? 'Valid' : 'Invalid'}`);
    } else {
      setIsValid(null);
    }
  }, [value]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
    console.log('📧 Email input blurred');
  };

  const showError = touched && value && !isValid;
  const showSuccess = value && isValid;

  return (
    <div className="w-full">
      <label 
        htmlFor="email" 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Recipient Email
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Mail className={`w-5 h-5 ${
            showError ? 'text-red-400' : 
            showSuccess ? 'text-green-400' : 
            'text-gray-400'
          }`} />
        </div>
        
        <input
          type="email"
          id="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="sales@company.com"
          className={`
            input-field pl-12 pr-12
            ${showError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${showSuccess ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {showSuccess && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {showError && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
      
      {showError && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Please enter a valid email address
        </p>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        The AI-generated summary will be sent to this email address
      </p>
    </div>
  );
};

export default EmailInput;

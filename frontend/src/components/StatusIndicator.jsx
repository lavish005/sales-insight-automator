/**
 * StatusIndicator Component
 * Shows processing status with animations
 */
import { Loader2, CheckCircle2, XCircle, Clock, Mail, Brain, Upload } from 'lucide-react';

const StatusIndicator = ({ status, progress, message }) => {
  console.log('📊 Status update:', { status, progress, message });

  const statusConfig = {
    idle: {
      icon: Clock,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-400',
      title: 'Ready to Process',
      description: 'Upload a file and enter email to get started'
    },
    uploading: {
      icon: Upload,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Uploading File',
      description: `${progress}% complete`,
      animate: true
    },
    processing: {
      icon: Brain,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Generating AI Summary',
      description: 'Analyzing your sales data...',
      animate: true
    },
    sending: {
      icon: Mail,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Sending Email',
      description: 'Delivering summary to your inbox...',
      animate: true
    },
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Success!',
      description: message || 'Summary generated and sent to your email'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Error',
      description: message || 'Something went wrong. Please try again.'
    }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  return (
    <div className={`
      rounded-xl p-6 transition-all duration-300
      ${config.bgColor}
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          flex-shrink-0 p-3 rounded-full bg-white/50
          ${config.animate ? 'animate-pulse' : ''}
        `}>
          {config.animate ? (
            <Loader2 className={`w-8 h-8 ${config.iconColor} animate-spin`} />
          ) : (
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {config.title}
          </h3>
          <p className="text-sm text-gray-600">
            {config.description}
          </p>
        </div>
      </div>

      {status === 'uploading' && (
        <div className="mt-4">
          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;

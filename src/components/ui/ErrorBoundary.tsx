import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import type { AppError } from '../../hooks/useErrorHandling';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showToast?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Show toast notification if enabled
    if (this.props.showToast !== false) {
      const isAppError = error && typeof error === 'object' && 'type' in error;
      const message = isAppError 
        ? (error as AppError).message 
        : 'An unexpected error occurred';
      toast.error(message);
    }
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, retry }) => {
  const isAppError = error && typeof error === 'object' && 'type' in error;
  const appError = isAppError ? error as AppError : null;

  const getErrorIcon = () => {
    if (appError) {
      switch (appError.type) {
        case 'authentication':
          return '🔐';
        case 'authorization':
          return '🚫';
        case 'validation':
          return '⚠️';
        case 'not_found':
          return '🔍';
        case 'network':
          return '🌐';
        default:
          return '⚡';
      }
    }
    return '💥';
  };

  const getErrorTitle = () => {
    if (appError) {
      switch (appError.type) {
        case 'authentication':
          return 'Authentication Required';
        case 'authorization':
          return 'Access Denied';
        case 'validation':
          return 'Invalid Data';
        case 'not_found':
          return 'Not Found';
        case 'network':
          return 'Connection Error';
        case 'server':
          return 'Server Error';
        default:
          return 'Application Error';
      }
    }
    return 'Unexpected Error';
  };

  const getErrorMessage = () => {
    if (appError) {
      return appError.message;
    }
    return error.message || 'Something went wrong. Please try again.';
  };

  const getActionButton = () => {
    if (appError) {
      switch (appError.type) {
        case 'authentication':
          return (
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          );
        case 'network':
          return (
            <button
              onClick={retry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry Connection
            </button>
          );
        default:
          return (
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          );
      }
    }
    return (
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reload
      </button>
    );
  };

  return (
    <div className="min-h-64 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{getErrorIcon()}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getErrorTitle()}
        </h2>
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>
        
        {/* Show field errors if available */}
        {appError?.fieldErrors && Object.keys(appError.fieldErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Validation Errors:
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(appError.fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <strong>{field}:</strong> {message}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          {getActionButton()}
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
        
        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Developer Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
            {appError?.details && (
              <pre className="mt-2 p-3 bg-blue-50 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(appError.details, null, 2)}
              </pre>
            )}
          </details>
        )}
      </div>
    </div>
  );
};

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for throwing errors that will be caught by ErrorBoundary
export const useErrorHandler = () => {
  return (error: Error | AppError) => {
    throw error;
  };
};

export default ErrorBoundary; 
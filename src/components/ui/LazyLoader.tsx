import React, { Suspense, lazy, ComponentType } from 'react';
import { usePerformance } from '../../hooks/usePerformance';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  componentName?: string;
}

// Default loading component
const DefaultLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
);

// Enhanced loading component with performance tracking
const PerformanceLoader: React.FC<{ componentName: string }> = ({ componentName }) => {
  const { measureRenderTime } = usePerformance();
  
  React.useEffect(() => {
    const endMeasure = measureRenderTime(`${componentName}-loading`);
    return endMeasure;
  }, [componentName, measureRenderTime]);

  return (
    <div className="flex items-center justify-center min-h-[200px] bg-gray-900/50 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-blue-600/30 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white mb-1">Loading {componentName}</p>
          <p className="text-xs text-gray-400">Optimizing performance...</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for different content types
export const SkeletonLoader: React.FC<{ type?: 'card' | 'table' | 'chart' | 'text' }> = ({ 
  type = 'card' 
}) => {
  const skeletonClass = "animate-pulse bg-gray-700 rounded";
  
  switch (type) {
    case 'card':
      return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className={`h-4 ${skeletonClass} mb-4 w-3/4`}></div>
          <div className={`h-3 ${skeletonClass} mb-2 w-full`}></div>
          <div className={`h-3 ${skeletonClass} mb-2 w-5/6`}></div>
          <div className={`h-3 ${skeletonClass} w-2/3`}></div>
        </div>
      );
    
    case 'table':
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className={`h-4 ${skeletonClass} w-1/4`}></div>
              <div className={`h-4 ${skeletonClass} w-1/3`}></div>
              <div className={`h-4 ${skeletonClass} w-1/6`}></div>
              <div className={`h-4 ${skeletonClass} w-1/4`}></div>
            </div>
          ))}
        </div>
      );
    
    case 'chart':
      return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className={`h-4 ${skeletonClass} mb-6 w-1/3`}></div>
          <div className="flex items-end gap-2 h-32">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`${skeletonClass} w-8`}
                style={{ height: `${Math.random() * 80 + 20}%` }}
              ></div>
            ))}
          </div>
        </div>
      );
    
    case 'text':
      return (
        <div className="space-y-2">
          <div className={`h-4 ${skeletonClass} w-full`}></div>
          <div className={`h-4 ${skeletonClass} w-5/6`}></div>
          <div className={`h-4 ${skeletonClass} w-4/5`}></div>
          <div className={`h-4 ${skeletonClass} w-3/4`}></div>
        </div>
      );
    
    default:
      return <DefaultLoader />;
  }
};

// Main lazy loader component
export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  fallback, 
  componentName = 'Component' 
}) => {
  const { measureRenderTime } = usePerformance();
  
  React.useEffect(() => {
    const endMeasure = measureRenderTime(componentName);
    return endMeasure;
  }, [componentName, measureRenderTime]);

  return (
    <Suspense fallback={fallback || <PerformanceLoader componentName={componentName} />}>
      {children}
    </Suspense>
  );
};

// HOC for creating lazy components with performance tracking
export const createLazyComponent = <T extends ComponentType<any>>({
  loader,
  fallback,
  componentName = 'LazyComponent'
}: LazyComponentProps): React.FC<React.ComponentProps<T>> => {
  const LazyComponent = lazy(loader);
  
  return (props: React.ComponentProps<T>) => (
    <LazyLoader 
      fallback={fallback || <PerformanceLoader componentName={componentName} />}
      componentName={componentName}
    >
      <LazyComponent {...props} />
    </LazyLoader>
  );
};

// Image lazy loading component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholder, 
  className = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="text-gray-500 text-sm">Loading...</div>
          )}
        </div>
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

// Performance monitoring wrapper
export const withPerformanceTracking = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    const { measureRenderTime } = usePerformance();
    
    React.useEffect(() => {
      const endMeasure = measureRenderTime(componentName);
      return endMeasure;
    }, [measureRenderTime]);

    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return WrappedComponent;
}; 
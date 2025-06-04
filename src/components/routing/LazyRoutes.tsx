import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

// Lazy loading wrapper with error boundary
const withLazyLoading = (
  Component: React.LazyExoticComponent<ComponentType<any>>,
  fallback?: React.ComponentType
) => {
  const WrappedComponent: React.FC<any> = (props) => {
    const FallbackComponent = fallback || (() => (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    ));
    
    return (
      <ErrorBoundary>
        <Suspense fallback={<FallbackComponent />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `LazyLoaded(Component)`;
  return WrappedComponent;
};

// Page loading skeleton
const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
    <div className="animate-pulse space-y-8 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 bg-zinc-700 rounded w-64"></div>
          <div className="h-4 bg-zinc-800 rounded w-48"></div>
        </div>
        <div className="h-10 bg-zinc-700 rounded w-32"></div>
      </div>
      
      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800 rounded-xl"></div>
        ))}
      </div>
      
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 bg-zinc-800 rounded-xl"></div>
          <div className="h-80 bg-zinc-800 rounded-xl"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Chart loading skeleton
const ChartSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="h-6 bg-zinc-700 rounded w-48"></div>
    <div className="h-64 bg-zinc-800 rounded-lg"></div>
  </div>
);

// Form loading skeleton
const FormSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="h-8 bg-zinc-700 rounded w-64"></div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-24"></div>
          <div className="h-10 bg-zinc-700 rounded"></div>
        </div>
      ))}
    </div>
    <div className="flex space-x-4">
      <div className="h-10 bg-amber-600 rounded w-24"></div>
      <div className="h-10 bg-zinc-700 rounded w-24"></div>
    </div>
  </div>
);

// Lazy-loaded components with performance optimizations

// Core pages with heavy imports
export const LazyDashboard = withLazyLoading(
  lazy(() => import('../../pages/Dashboard').then(module => ({ 
    default: module.default 
  }))),
  PageSkeleton
);

export const LazyAnalyticsDashboard = withLazyLoading(
  lazy(() => import('../../components/analytics/AnalyticsDashboard')),
  ChartSkeleton
);

export const LazyFinances = withLazyLoading(
  lazy(() => import('../../pages/Finances')),
  PageSkeleton
);

export const LazyTicketing = withLazyLoading(
  lazy(() => import('../../pages/Ticketing')),
  PageSkeleton
);

export const LazyArtists = withLazyLoading(
  lazy(() => import('../../pages/Artists')),
  PageSkeleton
);

export const LazyCustomers = withLazyLoading(
  lazy(() => import('../../pages/Customers')),
  PageSkeleton
);

export const LazyInventory = withLazyLoading(
  lazy(() => import('../../pages/Inventory')),
  PageSkeleton
);

export const LazyStaffManagement = withLazyLoading(
  lazy(() => import('../../pages/StaffManagement')),
  PageSkeleton
);

export const LazyMarketing = withLazyLoading(
  lazy(() => import('../../pages/Marketing')),
  PageSkeleton
);

export const LazySettings = withLazyLoading(
  lazy(() => import('../../pages/Settings')),
  FormSkeleton
);

export const LazyProjects = withLazyLoading(
  lazy(() => import('../../pages/Projects')),
  PageSkeleton
);

export const LazyAITools = withLazyLoading(
  lazy(() => import('../../pages/AITools')),
  PageSkeleton
);

export const LazyDocuments = withLazyLoading(
  lazy(() => import('../../pages/Documents')),
  PageSkeleton
);

export const LazyFileManager = withLazyLoading(
  lazy(() => import('../../pages/FileManager')),
  PageSkeleton
);

export const LazyCalendarView = withLazyLoading(
  lazy(() => import('../../pages/CalendarView')),
  PageSkeleton
);

// Detail pages
export const LazyEventDetail = withLazyLoading(
  lazy(() => import('../../pages/EventDetail')),
  FormSkeleton
);

export const LazyCreateEvent = withLazyLoading(
  lazy(() => import('../../pages/CreateEvent')),
  FormSkeleton
);

export const LazyArtistDetail = withLazyLoading(
  lazy(() => import('../../pages/ArtistDetail')),
  FormSkeleton
);

export const LazyCustomerDetail = withLazyLoading(
  lazy(() => import('../../pages/CustomerDetail')),
  FormSkeleton
);

export const LazyInventoryDetail = withLazyLoading(
  lazy(() => import('../../pages/InventoryDetail')),
  FormSkeleton
);

// Specialized pages
export const LazyArtistRoyalties = withLazyLoading(
  lazy(() => import('../../pages/ArtistRoyalties')),
  ChartSkeleton
);

export const LazyCustomerLoyalty = withLazyLoading(
  lazy(() => import('../../pages/CustomerLoyalty')),
  PageSkeleton
);

export const LazyCreateCampaign = withLazyLoading(
  lazy(() => import('../../pages/CreateCampaign')),
  FormSkeleton
);

// Finance pages
export const LazyAdvancedReporting = withLazyLoading(
  lazy(() => import('../../pages/Finances/AdvancedReporting')),
  ChartSkeleton
);

export const LazyFinanceArtistRoyalties = withLazyLoading(
  lazy(() => import('../../pages/Finances/ArtistRoyalties')),
  ChartSkeleton
);

// Ticketing pages
export const LazyEventReviews = withLazyLoading(
  lazy(() => import('../../pages/Ticketing/EventReviews')),
  PageSkeleton
);

// Authentication pages (lightweight, no complex skeletons needed)
export const LazyLogin = withLazyLoading(
  lazy(() => import('../../pages/Login'))
);

// Heavy components with chart libraries
export const LazyFloorPlanEditor = withLazyLoading(
  lazy(() => import('../../components/FloorPlanEditor/FloorPlanEditor')),
  ChartSkeleton
);

export const LazySustainabilityMetrics = withLazyLoading(
  lazy(() => import('../../components/sustainability/SustainabilityMetrics')),
  ChartSkeleton
);

export const LazyPredictiveAnalytics = withLazyLoading(
  lazy(() => import('../../components/analytics/PredictiveAnalytics')),
  ChartSkeleton
);

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload Dashboard after initial load
  setTimeout(() => {
    import('../../pages/Dashboard');
  }, 100);
  
  // Preload frequently accessed routes
  setTimeout(() => {
    import('../../pages/Ticketing');
    import('../../pages/Finances');
  }, 1000);
  
  // Preload analytics after user interaction
  setTimeout(() => {
    import('../../components/analytics/AnalyticsDashboard');
  }, 2000);
};

// Route chunk names for webpack optimization
export const routeChunkNames = {
  dashboard: 'dashboard',
  ticketing: 'ticketing', 
  finances: 'finances',
  analytics: 'analytics',
  artists: 'artists',
  customers: 'customers',
  inventory: 'inventory',
  staff: 'staff',
  marketing: 'marketing',
  settings: 'settings',
  aiTools: 'ai-tools',
  auth: 'auth'
};

export default {
  LazyDashboard,
  LazyAnalyticsDashboard,
  LazyFinances,
  LazyTicketing,
  LazyArtists,
  LazyCustomers,
  LazyInventory,
  LazyStaffManagement,
  LazyMarketing,
  LazySettings,
  LazyProjects,
  LazyAITools,
  LazyDocuments,
  LazyFileManager,
  LazyCalendarView,
  LazyEventDetail,
  LazyCreateEvent,
  LazyArtistDetail,
  LazyCustomerDetail,
  LazyInventoryDetail,
  LazyArtistRoyalties,
  LazyCustomerLoyalty,
  LazyCreateCampaign,
  LazyAdvancedReporting,
  LazyFinanceArtistRoyalties,
  LazyEventReviews,
  LazyLogin,
  LazyFloorPlanEditor,
  LazySustainabilityMetrics,
  LazyPredictiveAnalytics,
  preloadCriticalRoutes,
  routeChunkNames
}; 
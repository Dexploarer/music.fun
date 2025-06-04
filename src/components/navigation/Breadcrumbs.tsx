import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className="mb-2 sm:mb-4 flex items-center overflow-x-auto text-xs sm:text-sm text-gray-400 whitespace-nowrap">
      <Link 
        to="/" 
        className="flex items-center hover:text-white"
      >
        <Home size={10} className="mr-1" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={10} className="mx-1 sm:mx-2" />
          {item.active ? (
            <span className="font-medium text-white">{item.label}</span>
          ) : (
            <Link 
              to={item.path}
              className="hover:text-white"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  if (paths.length === 0) {
    return [];
  }
  
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Build up breadcrumb items based on the current path
  let currentPath = '';
  
  paths.forEach((path, i) => {
    const isLast = i === paths.length - 1;
    currentPath += `/${path}`;
    
    // Format the label (capitalize and replace hyphens with spaces)
    let label = path.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    // Handle special cases for IDs
    if (
      (path.length === 36 && path.includes('-')) || // UUID format
      (/^[0-9a-f]{8,}$/.test(path)) // Shortened ID format
    ) {
      if (paths[i-1] === 'artists') {
        label = 'Artist Details';
      } else if (paths[i-1] === 'ticketing') {
        label = 'Event Details';
      } else {
        label = 'Details';
      }
    }
    
    breadcrumbs.push({
      label,
      path: currentPath,
      active: isLast
    });
  });
  
  return breadcrumbs;
}

export default Breadcrumbs;
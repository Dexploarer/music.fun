import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  showLabel = false, 
  className = '' 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-9 w-9 p-2',
    lg: 'h-10 w-10 p-2.5'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative rounded-lg border border-border bg-background text-foreground
          hover:bg-accent hover:text-accent-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-all duration-200 ease-in-out
          shadow-sm hover:shadow-md
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        <div className="relative">
          {/* Sun Icon */}
          <Sun 
            size={iconSizes[size]} 
            className={`
              absolute inset-0 transition-all duration-300 ease-in-out
              ${theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-0'
              }
            `}
          />
          
          {/* Moon Icon */}
          <Moon 
            size={iconSizes[size]} 
            className={`
              absolute inset-0 transition-all duration-300 ease-in-out
              ${theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-0'
              }
            `}
          />
        </div>
      </button>
      
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {theme === 'light' ? 'Light' : 'Dark'} mode
        </span>
      )}
    </div>
  );
};

export default ThemeToggle; 
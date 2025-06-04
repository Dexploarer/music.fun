import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-95'
  );

  const variants = {
    primary: cn(
      'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      'hover:shadow-lg hover:-translate-y-0.5'
    ),
    secondary: cn(
      'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      'border border-border'
    ),
    destructive: cn(
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      'hover:shadow-lg'
    ),
    outline: cn(
      'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      'hover:border-accent-foreground/20'
    ),
    ghost: cn(
      'hover:bg-accent hover:text-accent-foreground',
      'focus:bg-accent focus:text-accent-foreground'
    ),
    link: cn(
      'text-primary underline-offset-4 hover:underline',
      'focus:underline'
    ),
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 py-2 text-sm gap-2',
    lg: 'h-10 px-6 py-2 text-base gap-2',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {!loading && leftIcon && leftIcon}
      
      <span className={cn(loading && 'ml-2')}>
        {children}
      </span>
      
      {!loading && rightIcon && rightIcon}
    </button>
  );
}; 
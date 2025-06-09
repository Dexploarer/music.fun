import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>
type CardContentProps = React.HTMLAttributes<HTMLDivElement>
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  size = 'md',
  hover = false,
  ...props
}) => {
  const baseClasses = cn(
    'rounded-lg border bg-card text-card-foreground transition-all duration-200',
    hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
  );

  const variants = {
    default: 'border-border shadow-sm',
    elevated: 'border-border shadow-md hover:shadow-lg',
    outline: 'border-2 border-border',
    glass: 'backdrop-blur-md bg-card/80 border-border/50 shadow-lg',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
);

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);

const CardContent: React.FC<CardContentProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('pt-0', className)}
    {...props}
  />
);

const CardFooter: React.FC<CardFooterProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
}; 
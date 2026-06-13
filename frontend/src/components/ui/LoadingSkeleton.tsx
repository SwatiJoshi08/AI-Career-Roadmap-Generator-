import React from 'react';

export interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const baseStyle = 'animate-pulse bg-slate-200';
  
  const variants = {
    text: 'h-4 w-3/4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} />
  );
};

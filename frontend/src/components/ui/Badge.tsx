import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeStatus = 'active' | 'completed' | 'pending' | 'fallback' | 'queued' | 'failed' | 'draft' | 'processing';

export interface BadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className }) => {
  const normalized = status.toLowerCase();
  
  let colorClass = 'bg-gray-100 text-gray-800'; // default draft/unknown

  if (['active', 'completed'].includes(normalized)) {
    colorClass = 'bg-green-100 text-green-800';
  } else if (['pending', 'fallback', 'queued'].includes(normalized)) {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else if (['failed'].includes(normalized)) {
    colorClass = 'bg-red-100 text-red-800';
  } else if (['processing'].includes(normalized)) {
    colorClass = 'bg-blue-100 text-blue-800';
  }

  return (
    <span className={twMerge(clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass, className))}>
      {label || status}
    </span>
  );
};

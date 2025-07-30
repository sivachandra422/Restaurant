'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  variant?: 'veg' | 'signature' | 'special' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function PremiumBadge({ variant = 'default', children, className }: PremiumBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    veg: 'bg-green-100 text-green-800 border border-green-200',
    signature: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200',
    special: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200',
    default: 'bg-stone-100 text-stone-800 border border-stone-200',
  };

  return (
    <span className={cn(baseClasses, variantClasses[variant], className)}>
      {variant === 'veg' && (
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
      )}
      {variant === 'signature' && (
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
      )}
      {variant === 'special' && (
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
      )}
      {children}
    </span>
  );
}
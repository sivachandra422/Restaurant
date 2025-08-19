'use client';

import React from 'react';
import { Loader2, ChefHat, Utensils, Clock } from 'lucide-react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function SkeletonLoader({ className = '', lines = 3, height = 'h-4' }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton skeleton-text ${height} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

interface MenuCardSkeletonProps {
  className?: string;
}

export function MenuCardSkeleton({ className = '' }: MenuCardSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <ChefHat className="w-12 h-12 text-neutral-300 animate-pulse" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="skeleton skeleton-text h-5 w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="skeleton skeleton-text h-4 w-full" />
          <div className="skeleton skeleton-text h-4 w-2/3" />
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="skeleton skeleton-text h-6 w-20" />
          <div className="skeleton skeleton-text h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-neutral-500',
    white: 'text-white'
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({ progress, className = '', showLabel = false, animated = true }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Loading...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${progress}%`,
            transition: animated ? 'width 0.3s ease' : 'none'
          }}
        />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isVisible, message = 'Loading...', className = '' }: LoadingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-neutral-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface LoadingGridProps {
  count: number;
  className?: string;
}

export function LoadingGrid({ count, className = '' }: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <MenuCardSkeleton key={index} />
      ))}
    </div>
  );
}

interface LoadingMessageProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function LoadingMessage({ message, icon = <Clock className="w-6 h-6" />, className = '' }: LoadingMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="text-neutral-400 mb-4 animate-pulse">
        {icon}
      </div>
      <p className="text-neutral-600 text-lg font-medium">{message}</p>
      <div className="mt-4 flex space-x-1">
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

interface InfiniteScrollLoaderProps {
  isVisible: boolean;
  className?: string;
}

export function InfiniteScrollLoader({ isVisible, className = '' }: InfiniteScrollLoaderProps) {
  if (!isVisible) return null;
  
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center space-x-3 text-neutral-600">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary-500 rounded-full animate-spin" />
        <span className="text-sm">Loading more items...</span>
      </div>
    </div>
  );
}

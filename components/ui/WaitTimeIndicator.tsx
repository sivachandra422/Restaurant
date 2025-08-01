'use client';

import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/data/sriKanyaMenu';
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext';

interface WaitTimeIndicatorProps {
  item: MenuItem;
  showTrending?: boolean;
}

export function WaitTimeIndicator({ item, showTrending = true }: WaitTimeIndicatorProps) {
  const { getWaitTime } = useCustomerExperience();
  const waitTime = getWaitTime(item);

  const getWaitTimeColor = (time: number) => {
    if (time <= 15) return 'bg-green-500';
    if (time <= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getWaitTimeText = (time: number) => {
    if (time <= 15) return 'Quick';
    if (time <= 25) return 'Normal';
    return 'Popular';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Wait Time Badge */}
      <Badge 
        className={`${getWaitTimeColor(waitTime)} text-white border-0 font-medium text-xs px-2 py-1 shadow-md`}
      >
        <Clock className="w-3 h-3 mr-1" />
        {waitTime} min
      </Badge>

      {/* Trending Badge */}
      {showTrending && item.trending && (
        <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-md animate-pulse">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </Badge>
      )}

      {/* Popularity Badge */}
      {item.popularity && item.popularity >= 8 && (
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-medium text-xs px-2 py-1 shadow-md">
          ⭐ Popular
        </Badge>
      )}
    </div>
  );
} 
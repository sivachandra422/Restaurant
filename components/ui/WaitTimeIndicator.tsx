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

export function WaitTimeIndicator({ item, showTrending = false }: WaitTimeIndicatorProps) {
  const { getWaitTime } = useCustomerExperience();
  const waitTime = getWaitTime(item);

  const getWaitTimeColor = (time: number) => {
    if (time <= 15) return 'bg-green-500';
    if (time <= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="flex items-center">
      {/* Wait Time Badge */}
      <Badge 
        className={`${getWaitTimeColor(waitTime)} text-white border-0 font-medium text-xs px-2 py-1 shadow-md`}
      >
        <Clock className="w-3 h-3 mr-1" />
        {waitTime} min
      </Badge>
    </div>
  );
} 
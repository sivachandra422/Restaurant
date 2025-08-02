'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MenuItem } from '@/lib/types';
import { PremiumMenuCard } from './PremiumMenuCard';
import { useCart } from '@/contexts/CartContext';

interface VirtualMenuGridProps {
  items: MenuItem[];
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
}

export function VirtualMenuGrid({ 
  items, 
  itemsPerRow = 2, 
  itemHeight = 320, 
  containerHeight = 600 
}: VirtualMenuGridProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart, removeFromCart, updateQuantity, state } = useCart();

  // Calculate total height
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * itemHeight;

  // Calculate visible items based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const startRow = Math.floor(scrollTop / itemHeight);
    const endRow = Math.ceil((scrollTop + containerHeight) / itemHeight);

    const startIndex = Math.max(0, startRow * itemsPerRow);
    const endIndex = Math.min(items.length, (endRow + 1) * itemsPerRow);

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [items.length, itemsPerRow, itemHeight]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(calculateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    calculateVisibleRange();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange]);

  // Get visible items
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  // Calculate offset for virtual positioning
  const offsetY = Math.floor(visibleRange.start / itemsPerRow) * itemHeight;

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;
              const quantity = state.items.find(cartItem => cartItem.id === item.id)?.quantity || 0;

              return (
                <div key={item.id} style={{ height: itemHeight }}>
                  <PremiumMenuCard
                    item={item}
                    quantity={quantity}
                    onAdd={() => addToCart(item, 1)}
                    onRemove={() => removeFromCart(item.id)}
                    onUpdateQuantity={(newQuantity) => updateQuantity(item.id, newQuantity)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 
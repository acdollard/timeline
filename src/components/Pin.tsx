import React, { useState } from 'react';
import { getPinColor } from '../utils/pinColors';
import type { TimelineEvent } from '../types/events';

interface PinProps {
  event: TimelineEvent;
  isBirth?: boolean;
  handleClick: (event: TimelineEvent) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Pin: React.FC<PinProps> = ({ event, isBirth = false, handleClick, orientation = 'horizontal' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get color from event_types if available, otherwise fall back to legacy type
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    // Fall back to legacy type-based color
    return getPinColor(event.type || 'birth');
  };

  const tooltipClasses = orientation === 'horizontal' 
    ? "absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
    : "absolute rotate-180 -translate-x-32 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap";

  return (
    <>
      <div 
        className="pin relative"
        onPointerEnter={() => {
          setShowTooltip(true)
        }}
        onPointerLeave={() => {
          setShowTooltip(false)
        }}
      >
        <div
          className="event rounded-full transition-all duration-200 absolute h-6 w-6 cursor-pointer"
          style={{ 
            backgroundColor: getEventColor(),
            left: orientation === 'horizontal' ? '50%' : undefined,
            top: orientation === 'vertical' ? '50%' : undefined,
            transform: orientation === 'horizontal' 
              ? 'translateX(-50%) scale(1)' 
              : orientation === 'vertical' 
                ? 'translateY(-50%) scale(1)' 
                : 'scale(1)',
            transformOrigin: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = orientation === 'horizontal' 
              ? 'translateX(-50%) scale(1.5)' 
              : orientation === 'vertical' 
                ? 'translateY(-50%) scale(1.5)' 
                : 'scale(1.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = orientation === 'horizontal' 
              ? 'translateX(-50%) scale(1)' 
              : orientation === 'vertical' 
                ? 'translateY(-50%) scale(1)' 
                : 'scale(1)';
          }}
          onClick={() => handleClick(event)}
        />
        {showTooltip && (
          <div 
            className={tooltipClasses}
            style={{ pointerEvents: 'none' }}
          >
            <div className="font-semibold">{event.name}</div>
            <div className="text-gray-300">{formattedDate}</div>
          </div>
        )}
        {!isBirth && (
          <div className={`${
            orientation === 'horizontal' 
              ? 'h-20 w-0.5 bg-white mx-auto' 
              : 'w-20 h-0.5 bg-white my-auto'
          }`} />
        )}
      </div>
    </>
  );
};

export default Pin; 
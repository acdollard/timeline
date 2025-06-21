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

  const tooltipClasses = orientation === 'horizontal' 
    ? "absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
    : "absolute -translate-y-1/2 -right-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap";

  return (
    <>
      <div 
        className="pin relative"
        onPointerEnter={() => {
          setShowTooltip(true)
          console.log('pointer enter')
        }}
        onPointerLeave={() => {
          setShowTooltip(false)
          console.log('pointer leave')
        }}
      >
        <div
          className={`event ${getPinColor(event.type)} rounded-full transition-all duration-200 absolute h-6 w-6 hover:scale-150 ${
            orientation === 'horizontal' 
              ? 'left-1/2 -translate-x-1/2' 
              : 'top-1/2 -translate-y-1/2'
          } cursor-pointer`}
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
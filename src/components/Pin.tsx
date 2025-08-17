import React, { useState, useMemo } from 'react';
import { getPinColor } from '../utils/pinColors';
import type { TimelineEvent } from '../types/events';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';



interface PinProps {
  event: TimelineEvent;
  isBirth?: boolean;
  handleClick: (event: TimelineEvent) => void;
  isMobile?: boolean;
  index: number | 0;
}

const Pin: React.FC<PinProps> = ({ event, isBirth = false, handleClick, isMobile, index }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedDate = useMemo(() => {
    return new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [event.date]);

  useGSAP(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Pin timeline type:', isMobile ? 'mobile (vertical)' : 'desktop (horizontal)');
    }
    if (!isMobile) {
      gsap.to('.shaft', {
        height: 90,
        width: 0.5,
        duration: 0.2,
        stagger: 0.1,
        ease: 'power2.inOut',
      })
    } else {
      gsap.to('.shaft', {
        height: 0.5,
        width: 90,
        duration: 0.2,
        stagger: 0.1,
        ease: 'power2.inOut',
      })
    } 
  }, [isMobile])

  // Get color from event_types if available, otherwise fall back to legacy type
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    // Fall back to legacy type-based color
    return getPinColor(event.type || 'birth');
  };

  const tooltipClasses = !isMobile 
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
            left: !isMobile ? '50%' : undefined,
            top: isMobile ? '50%' : undefined,
            transform: !isMobile 
              ? 'translateX(-50%) scale(1)' 
              : isMobile 
                ? 'translateY(-50%) scale(1)' 
                : 'scale(1)',
            transformOrigin: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = !isMobile 
              ? 'translateX(-50%) scale(1.5)' 
              : isMobile 
                ? 'translateY(-50%) scale(1.5)' 
                : 'scale(1.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = !isMobile 
              ? 'translateX(-50%) scale(1)' 
              : isMobile 
                ? 'translateY(-50%) scale(1)' 
                : 'scale(1)';
          }}
          onClick={() => handleClick(event)}
        />
        {showTooltip && (
          <div 
            className={`${tooltipClasses} ${index !== 0 && index % 2 === 0 ? "rotate-180 origin-bottom -translate-y-full" : ""}`}
            style={{ pointerEvents: 'none' }}
          >
            <p className="font-semibold">{event.name}</p>
            <div className="text-gray-300">{formattedDate}</div>
          </div>
        )}
        {!isBirth && (
          <div className={`shaft ${
            !isMobile 
              ? 'h-0 w-0.5 bg-white mx-auto' 
              : 'w-20 h-0.5 bg-white my-auto'
          }`} />
        )}
      </div>
    </>
  );
};

export default Pin; 
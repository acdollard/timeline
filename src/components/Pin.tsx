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

  // Temporarily disabled GSAP animation to debug pin visibility
  useGSAP(() => {

    if (!isMobile) {
      gsap.to(`.shaft-${event.id}`, {
        height: 90,
        width: 0.5,
        duration: 0.2,
        ease: 'power2.inOut',
      })
    } else {
      gsap.to(`.shaft-${event.id}`, {
        height: 0.5,
        width: 90,
        duration: 0.2,
        ease: 'power2.inOut',
      })
    } 
  }, [isMobile, event.id])

  // Get color from event_types if available, otherwise fall back to legacy type
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    // Fall back to legacy type-based color
    return getPinColor(event.type || 'birth');
  };

  const tooltipClasses = !isMobile 
    ? "absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10"
    : "absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10";

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
          className={`event rounded-full transition-all duration-200 absolute cursor-pointer ${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`}
          style={{ 
            backgroundColor: getEventColor(),
            left: !isMobile ? '50%' : '0px',
            top: isMobile ? '50%' : undefined,
            transform: !isMobile 
              ? 'translateX(-50%) translateY(-50%) scale(1)' 
              : 'translateY(-50%) scale(1)',
            transformOrigin: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = !isMobile 
              ? 'translateX(-50%) translateY(-50%) scale(1.5)' 
              : 'translateY(-50%) scale(1.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = !isMobile 
              ? 'translateX(-50%) translateY(-50%) scale(1)' 
              : 'translateY(-50%) scale(1)';
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
          <div className={`shaft shaft-${event.id} ${
            !isMobile 
              ? 'h-0 w-0.5 bg-white mx-auto' 
              : 'w-12 h-0.5 bg-white top-1/2'
          }`} />
        )}
      </div>
    </>
  );
};

export default Pin; 
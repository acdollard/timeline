import React, { useState } from 'react';
import { getPinColor } from '../utils/pinColors';
import type { EventType } from '../utils/pinColors';

interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: EventType;
  position?: number;
}

interface PinProps {
  event: TimelineEvent;
  isBirth?: boolean;
}

const Pin: React.FC<PinProps> = ({ event, isBirth = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="pin relative">
      <div
        className={`event h-6 w-6 hover:scale-150 ${getPinColor(event.type)} rounded-full transition-all duration-200 absolute left-1/2 -translate-x-1/2 cursor-pointer`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div className="absolute md:-translate-x-1/2 md:-top-16 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10 -rotate-90 md:rotate-0">
          <div className="font-semibold">{event.name}</div>
          <div className="text-gray-300">{formattedDate}</div>
        </div>
      )}
      {!isBirth && (
        <div className="h-20 w-0.5 bg-white mx-auto" />
      )}
    </div>
  );
};

export default Pin; 
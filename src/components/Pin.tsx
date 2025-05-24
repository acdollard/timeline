import React, { useState } from 'react';

interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: string;
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

  const getPinColor = (type: string) => {
    switch (type) {
      case 'birth':
        return 'bg-white';
      case 'school':
        return 'bg-blue-500';
      case 'travel':
        return 'bg-yellow-500';
      case 'relationships':
        return 'bg-pink-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="pin relative">
      <div
        className={`event h-6 w-6 hover:h-10 hover:w-10 ${getPinColor(event.type)} rounded-full transition-all duration-200 absolute left-1/2 -translate-x-1/2 cursor-pointer`}
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
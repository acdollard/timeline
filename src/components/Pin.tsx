import React from 'react';

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
      {!isBirth && (
        <div className="h-20 w-0.5 bg-white mx-auto" />
      )}
      <div
        className={`event h-6 w-6 hover:h-10 hover:w-10 ${getPinColor(event.type)} rounded-full transition-all duration-200 absolute left-1/2 -translate-x-1/2`}
        title={`${event.name} - ${new Date(event.date).toLocaleDateString()}`}
      />
    </div>
  );
};

export default Pin; 
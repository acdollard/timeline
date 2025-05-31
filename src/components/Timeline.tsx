import React from 'react';
import Pin from './Pin';
import type { EventType } from '../utils/pinColors';

interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: EventType;
  position?: number;
}

interface TimelineProps {
  events?: TimelineEvent[];
}

const Timeline = ({ events = [] }: TimelineProps) => {
  // Find the birth date and calculate the total timeline span
  const birthEvent = events.find(item => item.type === "birth");
  if (!birthEvent) {
    return <div>No birth event found</div>;
  }

  const birthDate = new Date(birthEvent.date);
  const today = new Date();
  const totalDays = Math.ceil((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalYears = Math.ceil(totalDays / 365);

  // Calculate position for each event
  const eventsWithPosition = events.map(item => {
    const eventDate = new Date(item.date);
    const daysSinceBirth = Math.ceil((eventDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const position = (daysSinceBirth / totalDays) * 100;
    return { ...item, position };
  });

  return (
    <div className="timeline-container flex flex-col h-auto">
      <div id="timeline-line" className="bg-white h-1 flex flex-row relative">
      {eventsWithPosition.map((item, index) => (
          <div 
            key={item.id}
            className={`flex flex-col h-auto absolute z-5 ${
              item.type === "birth"
                ? "-translate-y-2.5"
                : "-translate-y-full"
            }`}
            style={{ left: `${item.position}%`}}
          >
            <Pin event={item} isBirth={item.type === "birth"} />
          </div>
        ))}
        {Array.from({ length: totalYears }).map((_, index) => {
          const year = birthDate.getFullYear() + index + 1;
          return (
            <React.Fragment key={year}>
              <div
                className="w-1 h-4 bg-white absolute"
                style={{ left: `${((index + 1) / totalYears) * 100}%` }}
                />
              {index % 5 === 0 && (
                <div 
                className="absolute top-6 text-white text-xs bg-gray-900 z-10"
                style={{ 
                  left: `${((index + 1) / totalYears) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
                >
                  {year}
                </div>
              )}
            </React.Fragment>
          );
        })}

      </div>
    </div>
  );
};

export default Timeline; 
import React, { useState } from 'react';
import Timeline from './Timeline';
import TimelineFilters from './TimelineFilters';
import type { EventType } from '../utils/pinColors';

interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: EventType;
}

interface TimelineContainerProps {
  events: TimelineEvent[];
}

const TimelineContainer = ({ events }: TimelineContainerProps) => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(() => [
    'birth',
    'school',
    'travel',
    'relationships',
    'move',
    'career',
    'pets',
    'bucket-list',
    'hobbies'
  ]);

  const filteredEvents = events.filter(event => selectedTypes.includes(event.type));

  return (
    <>
      <div className="w-full h-[80vh] flex flex-col justify-center">
        <div className="my-auto">
          <Timeline events={filteredEvents} />
        </div>
      </div>
      <TimelineFilters
        onFilterChange={setSelectedTypes}
        onAddClick={() => {
          // Handle add click
          console.log("Add clicked");
        }}
      />
    </>
  );
};

export default TimelineContainer; 
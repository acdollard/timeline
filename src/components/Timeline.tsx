import React, { useState, useEffect } from 'react';
import Pin from './Pin';
import type { EventType } from '../utils/pinColors';
import EventModal from './EventModal';
import EventFormModal from './EventFormModal';
import { eventApi } from '../api/events';
import type { TimelineEvent } from '../types/events';

interface TimelineProps {
  initialEvents?: TimelineEvent[];
}

const Timeline = ({ initialEvents = [] }: TimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      const response = await eventApi.getAll();
      if (response.data) {
        setEvents(response.data);
      }
    };
    loadEvents();
  }, []);

  // Find the birth date and calculate the total timeline span
  const birthEvent = events.find(item => item.type === "birth");
  if (!birthEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-400 mb-4">No birth event found</p>
        <button
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          + Add Birth Event
        </button>
        <EventFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={async (event) => {
            const response = await eventApi.create(event);
            if (response.data) {
              setEvents([...events, response.data]);
            }
          }}
        />
      </div>
    );
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

  const handlePinClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <>
      <div className="timeline-container flex flex-col h-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowFormModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            + Add Event
          </button>
        </div>
        <div id="timeline-line" className="bg-white h-1 flex flex-row relative">
          {eventsWithPosition.map((item) => (
            <div 
              key={item.id}
              className={`flex flex-col h-auto absolute ${
                item.type === "birth"
                  ? "-translate-y-2.5"
                  : "-translate-y-full"
              }`}
              style={{ left: `${item.position}%`}}
            >
              <Pin event={item} isBirth={item.type === "birth"} handleClick={handlePinClick}/>
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
                    className="absolute top-6 text-white text-xs bg-gray-900"
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
      <EventModal
        event={selectedEvent}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
      />
      <EventFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={async (event) => {
          const response = await eventApi.create(event);
          if (response.data) {
            setEvents([...events, response.data]);
          }
        }}
      />
    </>
  );
};

export default Timeline; 
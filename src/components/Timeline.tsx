import React, { useState, useMemo, useEffect } from 'react';
import Pin from './Pin';
import EventModal from './EventModal';
import EventFormModal from './EventFormModal';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';

interface TimelineProps {
  events?: TimelineEvent[];
  eventTypes: EventType[];
  setShowFormModal: (show: boolean) => void;
  showFormModal: boolean;
  handleCreateEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  handleUpdateEvent: (id: string, event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  onRefreshEventTypes: () => void;
  error: string | null;
  isLoading: boolean;
}

const Timeline = ({ 
  events = [], 
  eventTypes,
  setShowFormModal, 
  showFormModal, 
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  onRefreshEventTypes,
  error, 
}: TimelineProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (process.env.NODE_ENV === 'development') {
        console.log('Screen size detected:', mobile ? 'mobile' : 'desktop', 'width:', window.innerWidth);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Find the birth date and calculate the total timeline span
  const birthEvent = useMemo(() => {
    return events.find(item => item.event_types?.name === "birth" || item.type === "birth");
  }, [events]);

  const birthDate = useMemo(() => {
    return new Date(birthEvent?.date || '');
  }, [birthEvent?.date]);

  const totalDays = useMemo(() => {
    const today = new Date();
    return Math.ceil((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [birthDate]);

  const totalYears = useMemo(() => {
    return Math.ceil(totalDays / 365);
  }, [totalDays]);

  // Calculate position for each event
  const eventsWithPosition = useMemo(() => {
    return events.map(item => {
      const eventDate = new Date(item.date);
      const daysSinceBirth = Math.ceil((eventDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = (daysSinceBirth / totalDays) * 100;
      return { ...item, position };
    });
  }, [events, birthDate, totalDays]);

  const handlePinClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleUpdate = async (event: Omit<TimelineEvent, 'id'>) => {
    if (selectedEvent) {
      await handleUpdateEvent(selectedEvent.id, event);
      setShowUpdateForm(false);
      setShowModal(false);
      setSelectedEvent(null);
    }
  };

  const handleDelete = async (id: string) => {
    await handleDeleteEvent(id);
    setShowUpdateForm(false);
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Helper function to check if an event is a birth event
  const isBirthEvent = useMemo(() => {
    return (event: TimelineEvent) => {
      return event.event_types?.name === "birth" || event.type === "birth";
    };
  }, []);

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">
          {error}
        </div>
      )}
      <div className="timeline-container flex flex-col h-auto">
        {/* Desktop Timeline */}
        {!isMobile && (
          <div id="timeline-line" className="bg-white h-1 flex flex-row relative">
            {eventsWithPosition.map((item, index) => (
              <div 
                key={item.id}
                className={`flex flex-col h-auto absolute ${
                  isBirthEvent(item)
                    ? "-translate-y-2.5"
                    : "-translate-y-full"
                }
                ${index !== 0 && index % 2 === 0 ? "rotate-180 origin-bottom" : ""}`}
                style={{ left: `${item.position}%`}}
              >
                <Pin event={item} isBirth={isBirthEvent(item)} handleClick={handlePinClick} isMobile={false} index={index} />
              </div>
            ))}
            {Array.from({ length: totalYears }).map((_, index) => {
              const year = birthDate.getFullYear() + index + 1;
              return (
                <React.Fragment key={year}>
                  <div
                    className="w-0.5 h-4 bg-white absolute"
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
        )}

        {/* Mobile Timeline */}
        {isMobile && (
          <div className="w-1 bg-white flex flex-col relative h-[150vh] mx-10">
            {Array.from({ length: totalYears }).map((_, index) => {
              const year = birthDate.getFullYear() + index + 1;
              return (
                <React.Fragment key={year}>
                  <div
                    className="h-1 w-2 bg-white absolute translate"
                    style={{ top: `${((index + 1) / totalYears) * 100}%` }}
                  />

                  {index % 5 === 0 && (
                    <div 
                      className="absolute left-6 text-white text-xs bg-gray-900 "
                      style={{ 
                        top: `${((index + 1) / totalYears) * 100}%`,
                        transform: 'translateY(-50%) translateX(-210%)'
                      }}
                    >
                      {year}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {eventsWithPosition.map((item, index) => (
              <div 
                key={item.id}
                className={`flex flex-row h-auto absolute ${
                  isBirthEvent(item)
                    ? "-translate-x-2.5"
                    : "rotate-180"
                }`}
                style={{ top: `${item.position}%`}}
              >
                <Pin event={item} isBirth={isBirthEvent(item)} handleClick={handlePinClick} isMobile={true} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
      <EventModal
        event={selectedEvent}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        onUpdate={() => setShowUpdateForm(true)}
      />
      <EventFormModal
        isOpen={showFormModal || showUpdateForm}
        onClose={() => {
          setShowFormModal(false);
          setShowUpdateForm(false);
          setSelectedEvent(null);
        }}
        onSubmit={showUpdateForm ? handleUpdate : handleCreateEvent}
        onDelete={handleDelete}
        initialEvent={selectedEvent || undefined}
        eventTypes={eventTypes}
        onRefreshEventTypes={onRefreshEventTypes}
      />
    </>
  );
};

export default Timeline; 
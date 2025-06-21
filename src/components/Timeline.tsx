import React, { useState } from 'react';
import Pin from './Pin';
import type { EventType } from '../utils/pinColors';
import EventModal from './EventModal';
import EventFormModal from './EventFormModal';
import type { TimelineEvent } from '../types/events';

interface TimelineProps {
  events?: TimelineEvent[];
  setShowFormModal: (show: boolean) => void;
  showFormModal: boolean;
  handleCreateEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  handleUpdateEvent: (id: string, event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const Timeline = ({ 
  events = [], 
  setShowFormModal, 
  showFormModal, 
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  error, 
}: TimelineProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Find the birth date and calculate the total timeline span
  const birthEvent = events.find(item => item.type === "birth");

  const birthDate = new Date(birthEvent?.date || '');
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

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">
          {error}
        </div>
      )}
      <div className="timeline-container flex flex-col h-auto">
        {/* Desktop Timeline */}
        <div id="timeline-line" className="hidden md:block bg-white h-1 flex flex-row relative">
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
              <Pin event={item} isBirth={item.type === "birth"} handleClick={handlePinClick} orientation="horizontal"/>
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

        {/* Mobile Timeline */}
        <div id="mobile-timeline-line" className="md:hidden w-1 bg-white flex flex-col relative h-[150vh] mx-10">
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
          {eventsWithPosition.map((item) => (
            <div 
              key={item.id}
              className={`flex flex-row h-auto absolute ${
                item.type === "birth"
                  ? "-translate-x-2.5"
                  : "rotate-180"
              }`}
              style={{ top: `${item.position}%`}}
            >
              <Pin event={item} isBirth={item.type === "birth"} handleClick={handlePinClick} orientation="vertical"/>
            </div>
          ))}

        </div>
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
      />
    </>
  );
};

export default Timeline; 
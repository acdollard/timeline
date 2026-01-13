import React, { useState, useMemo, useEffect } from 'react';
import Pin from './Pin';
import EventModal from './EventModal';
import EventFormModal from './EventFormModal';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';
import CreateEventTypeModal from './CreateEventTypeModal';

interface TimelineProps {
  events?: TimelineEvent[];
  eventTypes: EventType[];
  setShowFormModal: (show: boolean) => void;
  setShowCreateEventTypeModal: (show: boolean) => void;
  showFormModal: boolean;
  showCreateEventTypeModal: boolean;
  handleCreateEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<TimelineEvent | void>;
  handleUpdateEvent: (id: string, event: Omit<TimelineEvent, 'id'>) => Promise<TimelineEvent | void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  onRefreshEventTypes: () => void;
  onRefreshEvents?: () => void; // Callback to refresh events after photo upload
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
  onRefreshEvents,
  error, 
  showCreateEventTypeModal,
  setShowCreateEventTypeModal,
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

  // Calculate year marker positions based on actual days
  const yearMarkers = useMemo(() => {
    const markers = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthYear = birthDate.getFullYear();
    
    
    for (let year = birthYear + 1; year <= currentYear; year++) {
      // Year markers should mark the START of each year (January 1st)
      const yearStart = new Date(year, 0, 1); // January 1st of the year
      
      // Calculate days from birth to the START of this year
      const daysToYearStart = Math.ceil((yearStart.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = (daysToYearStart / totalDays) * 100;
      
      markers.push({
        year,
        position: Math.min(position, 100) // Cap at 100%
      });
    }
    
    return markers;
  }, [birthDate, totalDays]);

  // Calculate position for each event
  const eventsWithPosition = useMemo(() => {
    return events.map((item, i) => {
      const eventDate = new Date(item.date);
      const daysSinceBirth = Math.ceil((eventDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = (daysSinceBirth / totalDays) * 100;

      return { ...item, position };
    });
  }, [events, birthDate, totalDays]);

  const eventsWithPositionAndHeight = useMemo(() => {
    const range = 180; // 6 months / 180 days
    const oneDay = 1000 * 60 * 60 * 24; // 1 day in milliseconds
    const minHeight = 30;
    const defaultHeight = 90;
    const heightIncrement = 30;
    
    // First pass: identify clusters
    const clusters: number[][] = [];
    let currentCluster: number[] = [];
    
    for (let i = 0; i < eventsWithPosition.length; i++) {
      const currentDate = new Date(eventsWithPosition[i].date).getTime();
      
      if (currentCluster.length === 0) {
        // Start a new cluster
        currentCluster = [i];
      } else {
        // Check if current event is within range of the LAST event in the current cluster
        const lastInClusterIndex = currentCluster[currentCluster.length - 1];
        const lastInClusterDate = new Date(eventsWithPosition[lastInClusterIndex].date).getTime();
        const daysBetween = Math.ceil((currentDate - lastInClusterDate) / oneDay);
        
        if (daysBetween <= range) {
          // Add to current cluster
          currentCluster.push(i);
          console.log(currentCluster);
        } else {
          // Current cluster is complete, start a new one
          clusters.push(currentCluster);
          currentCluster = [i];
          console.log(clusters);
        }
      }
    }
    
    // Don't forget the last cluster
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }
    
    // Second pass: assign heights based on cluster membership and position
    return eventsWithPosition.map((item, index) => {
      // Find which cluster this event belongs to
      const clusterIndex = clusters.findIndex(cluster => cluster.includes(index));
      
      if (clusters[clusterIndex].length === 1) {
        console.log(item);
        // Not part of any cluster
        return {...item, height: defaultHeight};
      }
      
      const cluster = clusters[clusterIndex];
      const positionInCluster = cluster.indexOf(index);
      
      // Each event in cluster gets a different height: minHeight + (position * increment)
      const height = minHeight + (positionInCluster * heightIncrement);
      
      return {...item, height: height};
    });
  }, [eventsWithPosition]);

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


  const handleCreateEventTypeSuccess = (newEventType: EventType) => {
    // Automatically select the new event type
    setShowCreateEventTypeModal(false);
    onRefreshEventTypes();
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
        {!isMobile && (
          <div id="timeline-line" className="bg-white h-1 flex flex-row relative">
            {yearMarkers.map((marker) => (
              <React.Fragment key={marker.year}>
                <div
                  className="w-0.5 h-4 bg-white absolute z-10"
                  style={{ left: `${marker.position}%` }}
                />
                {marker.year % 5 === 0 && (
                  <div 
                    className="absolute top-6 text-white text-xs bg-gray-900 z-10"
                    style={{ 
                      left: `${marker.position}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {marker.year}
                  </div>
                )}
              </React.Fragment>
            ))}
            {eventsWithPositionAndHeight.map((item, index) => (
              <div 
                key={item.id}
                className={`flex flex-col h-auto absolute z-20 ${
                  isBirthEvent(item)
                    ? ""
                    : "-translate-y-full"
                }
                ${index !== 0 && index % 2 === 0 ? "rotate-180 origin-bottom" : ""}`}
                style={{ left: `${item.position}%`}}
              >
                <Pin event={item} isBirth={isBirthEvent(item)} handleClick={handlePinClick} isMobile={false} index={index} height={item.height}/>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Timeline */}
        {isMobile && (
          <div className="flex flex-col relative h-screen mx-8 pb-20">
            {/* Timeline Line */}
            <div className="w-1 bg-white h-full absolute left-8"></div>
            
            {/* Year Markers */}
            {yearMarkers.map((marker) => (
              <React.Fragment key={marker.year}>
                <div
                  className="h-1 w-2 bg-white absolute left-8 z-10"
                  style={{ top: `${marker.position}%` }}
                />

                {marker.year % 5 === 0 && (
                  <div 
                    className="absolute left-6 text-white text-xs bg-gray-900 px-2 py-1 rounded z-10"
                    style={{ 
                      top: `${marker.position}%`,
                      transform: 'translateY(-50%) translateX(-180%)'
                    }}
                  >
                    {marker.year}
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {/* Pins */}
            {eventsWithPositionAndHeight.map((item, index) => (
              <div 
                key={item.id}
                className="absolute z-20"
                style={{ 
                  top: `${item.position}%`,
                  left: isBirthEvent(item) ? '4px' : '8px'
                }}
              >
                <Pin event={item} isBirth={isBirthEvent(item)} handleClick={handlePinClick} isMobile={true} index={index} height={item.height}/>
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
        onRefreshEvents={onRefreshEvents}
      />
      <CreateEventTypeModal
        isOpen={showCreateEventTypeModal}
        onClose={() => setShowCreateEventTypeModal(false)}
        onSuccess={handleCreateEventTypeSuccess}
      />
    </>
  );
};

export default Timeline; 
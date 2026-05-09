import React, { useState, useMemo, useEffect } from 'react';
import Pin, { type MobilePinLane } from './Pin';
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
        } else {
          // Current cluster is complete, start a new one
          clusters.push(currentCluster);
          currentCluster = [i];
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
      
      if (clusterIndex === -1 || clusters[clusterIndex].length === 1) {
        return { ...item, height: defaultHeight };
      }
      
      const cluster = clusters[clusterIndex];
      const positionInCluster = cluster.indexOf(index);
      
      // Each event in cluster gets a different height: minHeight + (position * increment)
      const height = minHeight + (positionInCluster * heightIncrement);
      
      return {...item, height: height};
    });
  }, [eventsWithPosition]);

  /** Mobile: scrollable height + Y positions with min gap; alternating lanes. */
  const mobileScrollLayout = useMemo(() => {
    const MIN_GAP = 52;
    const PAD = 56;
    const PIXELS_PER_DAY = 0.42;
    const oneDay = 86400000;

    const sorted = [...eventsWithPositionAndHeight].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const H0 = Math.max(
      720,
      PAD * 2 + totalDays * PIXELS_PER_DAY + sorted.length * MIN_GAP * 0.05
    );

    const daysSince = (item: (typeof eventsWithPositionAndHeight)[0]) =>
      Math.ceil(
        (new Date(item.date).getTime() - birthDate.getTime()) / oneDay
      );

    let prevY = -Infinity;
    const layoutById = new Map<
      string,
      { y: number; lane: MobilePinLane }
    >();
    let nonBirthIdx = 0;

    for (const item of sorted) {
      const days = daysSince(item);
      const ideal =
        PAD + (days / Math.max(1, totalDays)) * (H0 - PAD * 2);
      const y = Math.max(ideal, prevY + MIN_GAP);
      const birth =
        item.event_types?.name === 'birth' || item.type === 'birth';
      const lane: MobilePinLane = birth
        ? 'center'
        : nonBirthIdx++ % 2 === 0
          ? 'right'
          : 'left';
      layoutById.set(item.id, { y, lane });
      prevY = y;
    }

    const contentHeight = Math.max(H0, prevY + PAD + 48);

    const yearYs = yearMarkers.map((m) => ({
      year: m.year,
      y: PAD + (m.position / 100) * (contentHeight - PAD * 2),
    }));

    return { contentHeight, layoutById, yearYs };
  }, [eventsWithPositionAndHeight, birthDate, totalDays, yearMarkers]);

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
          <div id="timeline-line" className="desktop-timeline bg-white h-1 flex flex-row relative">
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

        {/* Mobile: center spine, scroll zoom (px + min gap), alternating pins */}
        {isMobile && mobileScrollLayout && (
          <div className="mobile-timeline mt-2 flex h-[calc(100dvh-10.5rem)] min-h-[min(70vh,560px)] w-full max-w-lg flex-col self-center">
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-1">
              <div
                className="relative mx-auto w-full"
                style={{
                  height: mobileScrollLayout.contentHeight,
                  minHeight: mobileScrollLayout.contentHeight,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white"
                  style={{ zIndex: 'var(--z-timeline-base)' }}
                />
                {mobileScrollLayout.yearYs.map((row) => (
                  <div key={row.year}>
                    <div
                      className="pointer-events-none absolute left-1/2 h-1 w-2 bg-white"
                      style={{
                        top: `${row.y}px`,
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 'var(--z-timeline-base)',
                      }}
                    />
                    {row.year % 5 === 0 && (
                      <div
                        className="pointer-events-none absolute left-2 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white"
                        style={{
                          top: `${row.y}px`,
                          transform: 'translateY(-50%)',
                          zIndex: 'var(--z-timeline-base)',
                        }}
                      >
                        {row.year}
                      </div>
                    )}
                  </div>
                ))}
                {eventsWithPositionAndHeight.map((item, index) => {
                  const L = mobileScrollLayout.layoutById.get(item.id);
                  if (!L) return null;
                  const { y, lane } = L;
                  const pinTransform =
                    lane === 'center'
                      ? 'translate(-50%, -50%)'
                      : lane === 'left'
                        ? 'translate(-100%, -50%)'
                        : 'translate(0, -50%)';
                  return (
                    <div
                      key={item.id}
                      className="absolute left-1/2"
                      style={{
                        top: `${y}px`,
                        transform: pinTransform,
                        zIndex: 'var(--z-timeline-pins)',
                      }}
                    >
                      <Pin
                        event={item}
                        isBirth={isBirthEvent(item)}
                        handleClick={handlePinClick}
                        isMobile={true}
                        index={index}
                        height={item.height}
                        mobileLane={lane}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
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
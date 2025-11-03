import { useState, useEffect, useMemo } from 'react';
import Timeline from './Timeline';
import TimelineFilters from './TimelineFilters';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';
import EventFormModal from './EventFormModal';
import CreateEventTypeModal from './CreateEventTypeModal';
import { supabase } from '../lib/supabase';

interface TimelineContainerProps {
  events: TimelineEvent[];
  sessionId: string;
}

const TimelineContainer = ({ events, sessionId }: TimelineContainerProps) => {
  
  console.log('🔍 Initial events from server:', events);
  console.log('🔍 Sample initial event with event_types:', events?.[0]);
  
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [userEvents, setUserEvents] = useState<TimelineEvent[]>(events);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCreateEventTypeModal, setShowCreateEventTypeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<{ id: string; displayName: string } | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      if (!sessionId) {
        throw new Error('No user ID available');
      }
      
      // Use API endpoint instead of direct Supabase query to ensure proper authentication
      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
      }
      const data = await eventsResponse.json();

      console.log('🔍 Client-side events from API:', data);
      console.log('🔍 Sample event with event_types:', data?.[0]);
      
      // Fetch event types separately for filters and form
      const response = await fetch('/api/event-types');
      if (!response.ok) {
        throw new Error(`Failed to fetch event types: ${response.statusText}`);
      }
      const eventTypesData = await response.json();

      setUserEvents(data || []);
      setEventTypes(eventTypesData || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events when sessionId is available
  useEffect(() => {
    if (sessionId) {
      fetchEvents();
    }
  }, [sessionId]);

  // Memoize filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    return userEvents.filter(event => {
      // Always include birth events
      if (event.event_types?.name === 'birth' || event.type === 'birth') {
        return true;
      }
      
      // If no event types are selected, show all events
      if (selectedTypeIds.length === 0) {
        return true;
      }
      
      // If event types are selected, only show events that match selected type IDs
      return selectedTypeIds.includes(event.event_type_id);
    });
  }, [selectedTypeIds, userEvents]);

  // Update heading when selected event type changes
  useEffect(() => {
    const heading = document.getElementById('timeline-heading');
    if (heading) {
      heading.textContent = selectedEventType ? selectedEventType.displayName : 'Summary Page';
    }
  }, [selectedEventType]);

  const handleCreateEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    try {
      setIsLoading(true);
      
      if (!sessionId) throw new Error('No user ID available');
      
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, user_id: sessionId }])
        .select(`
          *,
          event_types (
            id,
            name,
            display_name,
            color,
            icon
          )
        `)
        .single();

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, event: Omit<TimelineEvent, 'id'>) => {
    try {
      setIsLoading(true);
      
      if (!sessionId) throw new Error('No user ID available');

      const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .eq('user_id', sessionId)
        .select(`
          *,
          event_types (
            id,
            name,
            display_name,
            color,
            icon
          )
        `)
        .single();

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      setIsLoading(true);
      
      if (!sessionId) throw new Error('No user ID available');

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', sessionId);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const hasBirthEvent = userEvents.some(event => event.event_types?.name === 'birth');

  const handleFilterChange = (selectedTypes: string[]) => {
    setSelectedTypeIds(selectedTypes);
    // Update selected event type for heading
    if (selectedTypes.length === 0) {
      setSelectedEventType(null);
    } else {
      // Find the event type details
      const eventType = eventTypes.find(eventType => eventType.id === selectedTypes[0]);
      if (eventType) {
        const selectedType = { id: selectedTypes[0], displayName: eventType.displayName };
        setSelectedEventType(selectedType);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hasBirthEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">No Birth Event Found</h2>
          <p className="text-gray-400">Please add a birth event to start your timeline.</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add Birth Event
        </button>
        <EventFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleCreateEvent}
          initialEvent={{
            event_type_id: '', // Will be set when user selects birth type
            name: '',
            date: '',
            description: ''
          } as TimelineEvent}
          eventTypes={eventTypes}
          onRefreshEventTypes={fetchEvents}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col justify-center relative align-center sm:mb-24 md:mb-0">
        <div className="mb-36 sm:mb-48 md:mb-36">
          <Timeline 
            events={filteredEvents} 
            eventTypes={eventTypes}
            setShowFormModal={setShowFormModal} 
            showFormModal={showFormModal} 
            showCreateEventTypeModal={showCreateEventTypeModal}
            setShowCreateEventTypeModal={setShowCreateEventTypeModal}
            handleCreateEvent={handleCreateEvent}
            handleUpdateEvent={handleUpdateEvent}
            handleDeleteEvent={handleDeleteEvent}
            onRefreshEventTypes={fetchEvents}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="w-full flex flex-col justify-end relative">     
        <TimelineFilters
          eventTypes={eventTypes}
          onFilterChange={handleFilterChange}
          onAddClick={() => setShowFormModal(true)}
          onAddEventTypeClick={() => setShowCreateEventTypeModal(true)}
        />
      </div>
    </>
  );
};

export default TimelineContainer; 
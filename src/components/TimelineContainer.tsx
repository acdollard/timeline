import { useState, useEffect, useMemo } from 'react';
import Timeline from './Timeline';
import TimelineFilters from './TimelineFilters';
import type { TimelineEvent } from '../types/events';
import EventFormModal from './EventFormModal';
import { supabase } from '../lib/supabase';

interface TimelineContainerProps {
  events: TimelineEvent[];
  sessionId: string;
}

const TimelineContainer = ({ events, sessionId }: TimelineContainerProps) => {
  
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [userEvents, setUserEvents] = useState<TimelineEvent[]>(events);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<{ id: string; displayName: string } | null>(null);
  const [eventTypes, setEventTypes] = useState<{ id: string; displayName: string }[]>([]);

  const fetchEvents = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
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
        .eq("user_id", sessionId)
        .order("date", { ascending: true });
      
      const { data: eventTypes, error: eventTypesError } = await supabase
        .from("event_types")
        .select("*");

      if (error) throw error;
      setUserEvents(data || []);
      setEventTypes(eventTypes || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events when session is available
  useEffect(() => {
    fetchEvents();
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
      if (!sessionId) throw new Error('No authenticated user');
      
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
      if (!sessionId) throw new Error('No authenticated user');

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
      if (!sessionId) throw new Error('No authenticated user');

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
      const eventType = eventTypes.find(event => event.id === selectedTypes[0]);
      if (eventType) {
        const selectedType = { id: selectedTypes[0], displayName: (eventType as any).display_name };
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
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col justify-center relative align-center sm:mb-24 md:mb-0">
        <div className="mb-36">
          <Timeline 
            events={filteredEvents} 
            setShowFormModal={setShowFormModal} 
            showFormModal={showFormModal} 
            handleCreateEvent={handleCreateEvent}
            handleUpdateEvent={handleUpdateEvent}
            handleDeleteEvent={handleDeleteEvent}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="w-full flex flex-col justify-end relative">     
        <TimelineFilters
          onFilterChange={handleFilterChange}
          onAddClick={() => setShowFormModal(true)}
        />

      </div>
    </>
  );
};

export default TimelineContainer; 
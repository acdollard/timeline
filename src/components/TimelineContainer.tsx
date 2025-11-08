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
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [userEvents, setUserEvents] = useState<TimelineEvent[]>(events);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCreateEventTypeModal, setShowCreateEventTypeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<{ id: string; displayName: string } | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      if (!sessionId) {
        throw new Error('No user ID available');
      }

      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
      }
      const data = await eventsResponse.json();

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
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchEvents();
    }
  }, [sessionId]);

  const filteredEvents = useMemo(() => {
    return userEvents.filter(event => {
      if (event.event_types?.name === 'birth' || event.type === 'birth') {
        return true;
      }
      if (selectedTypeIds.length === 0) {
        return true;
      }
      return selectedTypeIds.includes(event.event_type_id);
    });
  }, [selectedTypeIds, userEvents]);

  useEffect(() => {
    const heading = document.getElementById('timeline-heading');
    if (heading) {
      heading.textContent = selectedEventType ? selectedEventType.displayName : 'Summary Page';
    }
  }, [selectedEventType]);

  const handleRetry = () => {
    fetchEvents();
  };

  const handleCreateEvent = async (event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> => {
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
          ),
          event_photos (
            id,
            event_id,
            user_id,
            file_name,
            file_path,
            file_size,
            mime_type,
            alt_text,
            sort_order,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) throw error;

      if (data && data.event_photos && data.event_photos.length > 0) {
        const photosWithUrls = await Promise.all(
          data.event_photos.map(async (photo: any) => {
            const { data: urlData } = await supabase.storage
              .from('event-photos')
              .createSignedUrl(photo.file_path, 3600);

            return {
              ...photo,
              url: urlData?.signedUrl || ''
            };
          })
        );
        data.photos = photosWithUrls;
        delete data.event_photos;
      } else if (data) {
        data.photos = [];
      }
      await fetchEvents();
      return data;
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> => {
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
          ),
          event_photos (
            id,
            event_id,
            user_id,
            file_name,
            file_path,
            file_size,
            mime_type,
            alt_text,
            sort_order,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) throw error;
      
      // Enrich photos with signed URLs if any exist
      if (data && data.event_photos && data.event_photos.length > 0) {
        const photosWithUrls = await Promise.all(
          data.event_photos.map(async (photo: any) => {
            const { data: urlData } = await supabase.storage
              .from('event-photos')
              .createSignedUrl(photo.file_path, 3600);
            
            return {
              ...photo,
              url: urlData?.signedUrl || ''
            };
          })
        );
        data.photos = photosWithUrls;
        delete data.event_photos;
      } else if (data) {
        data.photos = [];
      }
      
      await fetchEvents();
      return data;
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

  if (isLoading && isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-gray-300">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p>Loading your timeline…</p>
      </div>
    );
  }

  if (error && !isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Error: Failed to Load Timeline</h2>
          <p className="text-gray-400">Please try again later or contact support.</p>
        </div>
        <button
          onClick={handleRetry}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasBirthEvent && !error) {
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
        {error && (
          <div className="max-w-4xl mx-auto mb-4 px-4">
            <div className="bg-red-900/60 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-sm text-red-200/80">Some actions may be unavailable until the timeline reloads.</p>
              </div>
              <button
                onClick={handleRetry}
                className="ml-4 bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <div className="relative mb-36 sm:mb-48 md:mb-36">
          {isLoading && !isInitialLoad && (
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-3 text-gray-200">
                <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-sm">Updating timeline…</span>
              </div>
            </div>
          )}
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
            onRefreshEvents={fetchEvents}
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
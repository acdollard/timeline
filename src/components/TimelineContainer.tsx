import React, { useState, useEffect } from 'react';
import Timeline from './Timeline';
import TimelineFilters from './TimelineFilters';
import type { EventType } from '../utils/pinColors';
import type { TimelineEvent } from '../types/events';
import { eventService } from '../services/eventService';
import EventFormModal from './EventFormModal';
import { supabase } from '../lib/supabase';

const TimelineContainer: React.FC = () => {
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

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setFilteredEvents(events.filter(event => selectedTypes.includes(event.type)));
  }, [selectedTypes, events]);

  const handleCreateEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    try {
      setIsLoading(true);
      await eventService.create(event);
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
      await eventService.update(id, event);
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
      await eventService.delete(id);
      await fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full h-[80vh] flex flex-col justify-center">
        <div className="my-auto">
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
      <TimelineFilters
        onFilterChange={setSelectedTypes}
        onAddClick={() => setShowFormModal(true)}
      />
      <EventFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleCreateEvent}
      />
    </>
  );
};

export default TimelineContainer; 
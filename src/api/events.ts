import type { TimelineEvent } from '../types/events';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface EventResponse extends ApiResponse<TimelineEvent> {}
interface EventsResponse extends ApiResponse<TimelineEvent[]> {}

// Temporary in-memory storage (replace with actual database later)
let events: TimelineEvent[] = [];
let nextId = 1;

export const eventApi = {
  getAll: async (): Promise<EventsResponse> => {
    try {
      return {
        data: events,
        status: 200
      };
    } catch (error) {
      return {
        error: 'Failed to fetch events',
        status: 500
      };
    }
  },
  
  getOne: async (id: number): Promise<EventResponse> => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) {
        return {
          error: 'Event not found',
          status: 404
        };
      }
      return {
        data: event,
        status: 200
      };
    } catch (error) {
      return {
        error: 'Failed to fetch event',
        status: 500
      };
    }
  },
  
  create: async (event: Omit<TimelineEvent, 'id'>): Promise<EventResponse> => {
    try {
      const newEvent = {
        ...event,
        id: nextId++,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      events.push(newEvent);
      return {
        data: newEvent,
        status: 201
      };
    } catch (error) {
      return {
        error: 'Failed to create event',
        status: 500
      };
    }
  },
  
  update: async (id: number, event: Partial<TimelineEvent>): Promise<EventResponse> => {
    try {
      const index = events.findIndex(e => e.id === id);
      if (index === -1) {
        return {
          error: 'Event not found',
          status: 404
        };
      }
      
      const updatedEvent = {
        ...events[index],
        ...event,
        updatedAt: new Date().toISOString()
      };
      events[index] = updatedEvent;
      
      return {
        data: updatedEvent,
        status: 200
      };
    } catch (error) {
      return {
        error: 'Failed to update event',
        status: 500
      };
    }
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const index = events.findIndex(e => e.id === id);
      if (index === -1) {
        return {
          error: 'Event not found',
          status: 404
        };
      }
      
      events = events.filter(e => e.id !== id);
      return {
        status: 204
      };
    } catch (error) {
      return {
        error: 'Failed to delete event',
        status: 500
      };
    }
  }
}; 
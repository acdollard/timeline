import type { TimelineEvent } from '../types/events';

export const eventService = {
  async getAll(): Promise<TimelineEvent[]> {
    const response = await fetch('/api/events');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  async getOne(id: string): Promise<TimelineEvent> {
    const response = await fetch(`/api/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  },

  async create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  async update(id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  }
}; 
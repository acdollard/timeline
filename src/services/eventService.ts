import { supabase } from '../lib/supabase';
import type { TimelineEvent } from '../types/events';
import { photoService } from './photoService';

class EventService {
  async create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('events')
      .insert([{ ...event, user_id: session.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an event and all its associated photos
   * This ensures both table records and storage files are cleaned up
   */
  async delete(id: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    // First, delete all photos associated with this event
    // This removes files from both the bucket and the table
    try {
      await photoService.deletePhotosByEventId(id);
    } catch (error) {
      console.error('Error deleting event photos:', error);
      // Continue with event deletion even if photo deletion fails
    }

    // Then delete the event itself
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;
  }

  async getAll(): Promise<TimelineEvent[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('events')
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
      .eq('user_id', session.user.id)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getOne(id: string): Promise<TimelineEvent> {
    const response = await fetch(`/api/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  }
}

export const eventService = new EventService(); 
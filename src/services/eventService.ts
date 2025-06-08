import { supabase } from '../lib/supabase';
import type { TimelineEvent } from '../types/events';

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

  async delete(id: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

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
      .select('*')
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
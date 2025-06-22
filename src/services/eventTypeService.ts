import { supabase } from '../lib/supabase';
import type { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '../types/eventTypes';
import { logger } from '../utils/logger';

class EventTypeService {
  async getAll(): Promise<EventType[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('display_name', { ascending: true });

      if (error) throw error;
      
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error('Failed to fetch event types', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getDefault(): Promise<EventType[]> {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) throw error;
      
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error('Failed to fetch default event types', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getCustom(): Promise<EventType[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) throw error;
      
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error('Failed to fetch custom event types', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async create(eventType: CreateEventTypeRequest): Promise<EventType> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      // Check if name already exists
      const { data: existing } = await supabase
        .from('event_types')
        .select('id')
        .eq('name', eventType.name)
        .single();

      if (existing) {
        throw new Error('Event type with this name already exists');
      }

      const { data, error } = await supabase
        .from('event_types')
        .insert([{
          name: eventType.name,
          display_name: eventType.displayName,
          color: eventType.color,
          icon: eventType.icon,
          user_id: session.user.id,
          is_default: false,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error('Failed to create event type', { 
        eventType, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async update(id: string, updates: UpdateEventTypeRequest): Promise<EventType> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const updateData: any = {};
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('event_types')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error('Failed to update event type', { 
        id, 
        updates, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      // Check if event type is being used by any events
      const { data: eventsUsingType } = await supabase
        .from('events')
        .select('id')
        .eq('event_type_id', id)
        .limit(1);

      if (eventsUsingType && eventsUsingType.length > 0) {
        throw new Error('Cannot delete event type that is being used by events');
      }

      const { error } = await supabase
        .from('event_types')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to delete event type', { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getById(id: string): Promise<EventType> {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error('Failed to fetch event type by ID', { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  private mapDatabaseToType(data: any): EventType {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      color: data.color,
      icon: data.icon,
      isDefault: data.is_default,
      isActive: data.is_active,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const eventTypeService = new EventTypeService(); 
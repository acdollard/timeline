import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';
import type { EventType } from '../../../types/eventTypes';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function mapDatabaseToType(data: any): EventType {
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

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const { data, error } = await supabaseClient
      .from('event_types')
      .select('*')
      .eq('id', params.id)
      .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
      .single();

    if (error) throw error;
    const eventType = mapDatabaseToType(data);
    
    return jsonResponse(eventType, 200);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    logger.error('Failed to fetch event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const updates = await request.json();
    
    // Validate color format if provided
    if (updates.color) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      if (!colorRegex.test(updates.color)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid color format. Use hex format (e.g., #3B82F6)' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabaseClient
      .from('event_types')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    const updatedEventType = mapDatabaseToType(data);
    
    return jsonResponse(updatedEventType, 200);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    logger.error('Failed to update event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to update event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const { data: eventsUsingType, error: eventsError } = await supabaseClient
      .from('events')
      .select('id')
      .eq('event_type_id', params.id)
      .eq('user_id', session.user.id)
      .limit(1);

    if (eventsError) throw eventsError;
    if (eventsUsingType && eventsUsingType.length > 0) {
      throw new Error('Cannot delete event type that is being used by events');
    }

    const { error } = await supabaseClient
      .from('event_types')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) throw error;
    
    return new Response(null, {
      status: 204
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    logger.error('Failed to delete event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to delete event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 
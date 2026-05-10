import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import type { CreateEventTypeRequest, EventType } from '../../types/eventTypes';

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

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const { data, error } = await supabaseClient
      .from('event_types')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('display_name', { ascending: true });

    if (error) throw error;
    const eventTypes = data?.map(mapDatabaseToType) || [];
    
    return jsonResponse(eventTypes, 200);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    logger.error('Failed to fetch event types', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch event types',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const eventType: CreateEventTypeRequest = await request.json();
    
    // Validate required fields
    if (!eventType.name || !eventType.displayName || !eventType.color) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: name, displayName, and color are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate color format
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(eventType.color)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid color format. Use hex format (e.g., #3B82F6)' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { data: existing } = await supabaseClient
      .from('event_types')
      .select('id')
      .eq('name', eventType.name)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ error: 'Event type with this name already exists' }, 409);
    }

    const { data, error } = await supabaseClient
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
    const createdEventType = mapDatabaseToType(data);
    
    return jsonResponse(createdEventType, 201);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    logger.error('Failed to create event type', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 
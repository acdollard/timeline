import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';
import { deleteEventWithPhotos } from '../../../lib/eventDeletion';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function stripReadonlyEventFields(event: any) {
  const { id, user_id, event_types, event_photos, photos, created_at, updated_at, ...updates } = event;
  return updates;
}

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    if (!id) {
      return jsonResponse({ error: 'Event ID is required' }, 400);
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const { data, error } = await supabaseClient
      .from('events')
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
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) throw error;

    return jsonResponse(data, 200);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    console.error('Error fetching event:', error);
    return jsonResponse({ error: 'Failed to fetch event' }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id;
    if (!id) {
      return jsonResponse({ error: 'Event ID is required' }, 400);
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const event = stripReadonlyEventFields(await request.json());

    const { data, error } = await supabaseClient
      .from('events')
      .update(event)
      .eq('id', id)
      .eq('user_id', session.user.id)
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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    console.error('Error updating event:', error);
    return new Response(JSON.stringify({ error: 'Failed to update event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    if (!id) {
      return jsonResponse({ error: 'Event ID is required' }, 400);
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);

    await deleteEventWithPhotos(supabaseClient, id, session.user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    console.error('Error deleting event:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 
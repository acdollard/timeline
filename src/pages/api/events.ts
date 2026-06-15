import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../lib/supabase';
import { deleteOwnedEventWithPhotos, EventNotFoundError } from '../../lib/eventDeletion';
import type { EventPhoto } from '../../types/eventPhotos';

const BUCKET_NAME = 'event-photos';

/**
 * Helper function to enrich photos with signed URLs
 */
async function enrichPhotosWithUrls(supabaseClient: any, photos: EventPhoto[]): Promise<EventPhoto[]> {
  if (!photos || photos.length === 0) return [];

  const photosWithUrls = await Promise.all(
    photos.map(async (photo) => {
      const { data: urlData } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .createSignedUrl(photo.file_path, 3600);

      return {
        ...photo,
        url: urlData?.signedUrl || ''
      };
    })
  );

  return photosWithUrls;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function enrichEventPhotos(supabaseClient: any, event: any) {
  if (event.event_photos && event.event_photos.length > 0) {
    event.photos = await enrichPhotosWithUrls(supabaseClient, event.event_photos);
    delete event.event_photos;
  } else {
    event.photos = [];
  }

  return event;
}

function stripReadonlyEventFields(event: any) {
  const { id, user_id, event_types, event_photos, photos, created_at, updated_at, ...updates } = event;
  return updates;
}

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);

    if (params.id) {
      // Get single event
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
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Supabase error (single event):', error);
        throw error;
      }

      // Enrich photos with signed URLs
      await enrichEventPhotos(supabaseClient, data);

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

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
      .eq('user_id', session.user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase error (all events):', error);
      throw error;
    }

    // Enrich all events' photos with signed URLs
    const eventsWithPhotos = await Promise.all(
      (data || []).map(async (event) => {
        return enrichEventPhotos(supabaseClient, event);
      })
    );

    return new Response(JSON.stringify(eventsWithPhotos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch events',
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
    const event = stripReadonlyEventFields(await request.json());
    const { data, error } = await supabaseClient
      .from('events')
      .insert([{ ...event, user_id: session.user.id }])
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
    await enrichEventPhotos(supabaseClient, data);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    return new Response(JSON.stringify({ error: 'Failed to create event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ request, params, cookies }) => {
  try {
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);

    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const event = stripReadonlyEventFields(await request.json());
    const { data, error } = await supabaseClient
      .from('events')
      .update(event)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
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
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);

    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await deleteOwnedEventWithPhotos(supabaseClient, params.id, session.user.id);

    return new Response(null, {
      status: 204
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
    }

    if (error instanceof EventNotFoundError) {
      return jsonResponse({ error: error.message }, 404);
    }

    return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 
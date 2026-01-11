import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { EventPhoto } from '../../types/eventPhotos';

const BUCKET_NAME = 'event-photos';

/**
 * Helper function to enrich photos with signed URLs
 */
async function enrichPhotosWithUrls(photos: EventPhoto[]): Promise<EventPhoto[]> {
  if (!photos || photos.length === 0) return [];

  const photosWithUrls = await Promise.all(
    photos.map(async (photo) => {
      const { data: urlData } = await supabase.storage
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

export const GET: APIRoute = async ({ params }) => {
  try {
    if (params.id) {
      // Get single event
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return new Response(JSON.stringify({ error: 'No authenticated user' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

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
      if (data.event_photos && data.event_photos.length > 0) {
        data.photos = await enrichPhotosWithUrls(data.event_photos);
        // Remove the raw event_photos field, keep only enriched photos
        delete data.event_photos;
      } else {
        data.photos = [];
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get all events for the authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'No authenticated user' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
        if (event.event_photos && event.event_photos.length > 0) {
          event.photos = await enrichPhotosWithUrls(event.event_photos);
          // Remove the raw event_photos field
          delete event.event_photos;
        } else {
          event.photos = [];
        }
        return event;
      })
    );

    return new Response(JSON.stringify(eventsWithPhotos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const event = await request.json();
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const event = await request.json();
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', params.id)
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
    return new Response(JSON.stringify({ error: 'Failed to update event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return new Response(null, {
      status: 204
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 
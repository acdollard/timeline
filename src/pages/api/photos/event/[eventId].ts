import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

const BUCKET_NAME = 'event-photos';

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const eventId = params.eventId;
    if (!eventId) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'No authenticated user' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id;

    // Fetch photos to delete
    const { data: photos, error: fetchError } = await supabase
      .from('event_photos')
      .select('id, file_path')
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Failed to fetch event photos:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch event photos' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (photos && photos.length > 0) {
      const filePaths = photos.map((photo) => photo.file_path);
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (storageError) {
        console.error('Failed to delete photos from storage:', storageError);
        return new Response(JSON.stringify({ error: 'Failed to delete photos from storage' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { error: deleteError } = await supabase
        .from('event_photos')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Failed to delete photo metadata:', deleteError);
        return new Response(JSON.stringify({ error: 'Failed to delete photo metadata' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Bulk photo deletion API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete event photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

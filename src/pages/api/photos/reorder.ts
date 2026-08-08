import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const userId = session.user.id;
    const body = await request.json();
    const photoIds: string[] = body.photoIds;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return new Response(JSON.stringify({ error: 'photoIds must be a non-empty array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: photos, error: fetchError } = await supabaseClient
      .from('event_photos')
      .select('id, user_id')
      .in('id', photoIds)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Failed to verify photos:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to verify photos for reorder' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!photos || photos.length !== photoIds.length) {
      return new Response(JSON.stringify({ error: 'One or more photos not found or access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Partial upserts cannot update only sort_order: PostgREST still builds an
    // INSERT row for the provided columns, so NOT NULL fields like event_id /
    // user_id / file_path become null and the request fails (or corrupts rows if
    // those columns are nullable). Update each owned row instead.
    for (let index = 0; index < photoIds.length; index++) {
      const photoId = photoIds[index];
      const { error: updateError } = await supabaseClient
        .from('event_photos')
        .update({ sort_order: index })
        .eq('id', photoId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update photo order:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update photo order' }), {
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
    if (error instanceof AuthenticationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('Photo reorder API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to reorder photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

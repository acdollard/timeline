import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

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

    const updates = photoIds.map((photoId, index) => ({ id: photoId, sort_order: index }));
    const { error: updateError } = await supabaseClient
      .from('event_photos')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) {
      console.error('Failed to update photo order:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update photo order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse({ error: error.message }, 401);
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

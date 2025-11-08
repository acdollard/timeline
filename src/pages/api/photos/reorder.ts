import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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
    const body = await request.json();
    const photoIds: string[] = body.photoIds;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return new Response(JSON.stringify({ error: 'photoIds must be a non-empty array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: photos, error: fetchError } = await supabase
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
    const { error: updateError } = await supabase
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

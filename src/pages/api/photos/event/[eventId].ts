import type { APIRoute } from 'astro';
import { deleteEventPhotosForUser } from '../../../../lib/eventPhotoCleanup';
import { AuthenticationError, getAuthenticatedRequest } from '../../../../lib/supabase';

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const eventId = params.eventId;
    if (!eventId) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    await deleteEventPhotosForUser(supabaseClient, eventId, session.user.id);

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

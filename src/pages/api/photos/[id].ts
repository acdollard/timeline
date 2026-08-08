import type { APIRoute } from 'astro';
import { deletePhotoForUser } from '../../../lib/eventPhotoCleanup';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const photoId = params.id;
    if (!photoId) {
      return new Response(JSON.stringify({ error: 'Photo ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { supabaseClient, session } = await getAuthenticatedRequest(cookies);
    const deleted = await deletePhotoForUser(supabaseClient, photoId, session.user.id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Photo not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
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

    console.error('Photo deletion API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

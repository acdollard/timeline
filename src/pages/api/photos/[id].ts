import type { APIRoute } from 'astro';
import { AuthenticationError, getAuthenticatedRequest } from '../../../lib/supabase';

const BUCKET_NAME = 'event-photos';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

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
    const userId = session.user.id;

    // Fetch photo to ensure it belongs to the user and get file path
    const { data: photo, error: photoError } = await supabaseClient
      .from('event_photos')
      .select('id, file_path, event_id, user_id')
      .eq('id', photoId)
      .eq('user_id', userId)
      .single();

    if (photoError || !photo) {
      return new Response(JSON.stringify({ error: 'Photo not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete file from storage
    const { error: storageError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove([photo.file_path]);

    if (storageError) {
      console.error('Failed to delete photo from storage:', storageError);
      return new Response(JSON.stringify({ error: 'Failed to delete photo from storage' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete database record
    const { error: deleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Failed to delete photo metadata:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete photo metadata' }), {
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

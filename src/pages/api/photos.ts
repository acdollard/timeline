import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import type { UploadPhotoResult } from '../../types/eventPhotos';

const BUCKET_NAME = 'event-photos';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Authenticate user using cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'No authenticated user' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set session from cookies
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

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const altText = formData.get('altText') as string | null;

    if (!file || !eventId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: file and eventId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'File must be an image' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File size must be less than 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify that the event belongs to the user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Upload file to storage bucket
    // Path structure: {user_id}/{event_id}/{filename}
    const fileExt = file.name.split('.').pop();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${Date.now()}-${randomStr}.${fileExt}`;
    const filePath = `${userId}/${eventId}/${fileName}`;

    // Convert File to ArrayBuffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: `Failed to upload photo: ${uploadError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 2: Insert metadata into event_photos table
    // Get the current max sort_order for this event
    const { data: existingPhotos } = await supabase
      .from('event_photos')
      .select('sort_order')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = existingPhotos?.sort_order != null 
      ? existingPhotos.sort_order + 1 
      : 0;

    const { data: photoData, error: dbError } = await supabase
      .from('event_photos')
      .insert({
        event_id: eventId,
        user_id: userId,
        file_name: file.name, // Original filename
        file_path: filePath, // Storage path
        file_size: file.size,
        mime_type: file.type,
        alt_text: altText || null,
        sort_order: sortOrder
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      return new Response(JSON.stringify({ error: `Failed to save photo metadata: ${dbError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Generate signed URL for immediate display
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour

    const signedUrl = urlData?.signedUrl || '';
    const result: UploadPhotoResult = {
      photo: {
        ...photoData,
        url: signedUrl
      },
      url: signedUrl
    };

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Photo upload API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

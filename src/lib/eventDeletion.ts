import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

export async function deleteEventWithPhotos(
  supabaseClient: SupabaseClient,
  userId: string,
  eventId: string
): Promise<void> {
  const { data: photos, error: photosError } = await supabaseClient
    .from('event_photos')
    .select('id, file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (photosError) {
    throw photosError;
  }

  if (photos && photos.length > 0) {
    const filePaths = photos.map((photo) => photo.file_path);
    const { error: storageError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (storageError) {
      throw storageError;
    }

    const { error: photoDeleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (photoDeleteError) {
      throw photoDeleteError;
    }
  }

  const { error: eventDeleteError } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (eventDeleteError) {
    throw eventDeleteError;
  }
}

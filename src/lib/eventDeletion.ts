import type { SupabaseClient } from '@supabase/supabase-js';

const EVENT_PHOTOS_BUCKET = 'event-photos';

export async function deleteOwnedEventWithPhotos(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const { data: photos, error: photosError } = await supabaseClient
    .from('event_photos')
    .select('file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (photosError) {
    throw photosError;
  }

  const filePaths = (photos || [])
    .map((photo) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  if (filePaths.length > 0) {
    const { error: storageError } = await supabaseClient.storage
      .from(EVENT_PHOTOS_BUCKET)
      .remove(filePaths);

    if (storageError) {
      throw storageError;
    }
  }

  if (photos && photos.length > 0) {
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

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type EventPhotoRecord = {
  file_path: string | null;
};

export async function deleteEventWithPhotos(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const { data: event, error: eventError } = await supabaseClient
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (eventError) {
    throw eventError;
  }

  if (!event) {
    return;
  }

  const { data: photos, error: photosError } = await supabaseClient
    .from('event_photos')
    .select('file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (photosError) {
    throw photosError;
  }

  const photoRows = (photos ?? []) as EventPhotoRecord[];
  const filePaths = photoRows
    .map((photo) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  if (filePaths.length > 0) {
    const { error: storageError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (storageError) {
      throw storageError;
    }

  }

  if (photoRows.length > 0) {
    const { error: deletePhotosError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (deletePhotosError) {
      throw deletePhotosError;
    }
  }

  const { error: deleteEventError } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (deleteEventError) {
    throw deleteEventError;
  }
}

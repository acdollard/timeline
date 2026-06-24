import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

async function fetchEventPhotosForUser(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<PhotoRecord[]> {
  const { data: photos, error } = await supabaseClient
    .from('event_photos')
    .select('id, file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return photos || [];
}

async function removePhotoFiles(
  supabaseClient: SupabaseClient,
  photos: PhotoRecord[]
): Promise<void> {
  const filePaths = photos
    .map((photo: PhotoRecord) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  if (filePaths.length === 0) {
    return;
  }

  const { error: storageError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (storageError) {
    throw storageError;
  }
}

export async function deletePhotoForUser(
  supabaseClient: SupabaseClient,
  photoId: string,
  userId: string
): Promise<boolean> {
  const { data: photo, error: photoError } = await supabaseClient
    .from('event_photos')
    .select('id, file_path')
    .eq('id', photoId)
    .eq('user_id', userId)
    .maybeSingle<PhotoRecord>();

  if (photoError) {
    throw photoError;
  }

  if (!photo) {
    return false;
  }

  const { error: deleteError } = await supabaseClient
    .from('event_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (deleteError) {
    throw deleteError;
  }

  await removePhotoFiles(supabaseClient, [photo]);

  return true;
}

export async function deleteEventPhotosForUser(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const photos = await fetchEventPhotosForUser(supabaseClient, eventId, userId);

  if (photos.length > 0) {
    const { error: deleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }
  }

  await removePhotoFiles(supabaseClient, photos);
}

export async function deleteOwnedEventWithPhotos(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<boolean> {
  const photos = await fetchEventPhotosForUser(supabaseClient, eventId, userId);
  const { data: deletedEvent, error: eventDeleteError } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle<{ id: string }>();

  if (eventDeleteError) {
    throw eventDeleteError;
  }

  if (photos.length > 0) {
    const { error: photoDeleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (photoDeleteError) {
      throw photoDeleteError;
    }
  }

  await removePhotoFiles(supabaseClient, photos);

  return Boolean(deletedEvent);
}

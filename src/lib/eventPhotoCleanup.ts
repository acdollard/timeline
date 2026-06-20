import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

async function removeStorageObjects(
  supabaseClient: SupabaseClient,
  filePaths: string[]
): Promise<void> {
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

  const { data: deletedPhotos, error: deleteError } = await supabaseClient
    .from('event_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId)
    .select('file_path');

  if (deleteError) {
    throw deleteError;
  }

  const filePaths = (deletedPhotos || [])
    .map((deletedPhoto: Pick<PhotoRecord, 'file_path'>) => deletedPhoto.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));
  await removeStorageObjects(supabaseClient, filePaths);

  return true;
}

export async function deleteEventPhotosForUser(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const { data: photos, error: fetchError } = await supabaseClient
    .from('event_photos')
    .select('id, file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (fetchError) {
    throw fetchError;
  }

  const filePaths = (photos || [])
    .map((photo: PhotoRecord) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  if (photos && photos.length > 0) {
    const { error: deleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }
  }

  await removeStorageObjects(supabaseClient, filePaths);
}

export async function deleteEventWithPhotosForUser(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const { data: photos, error: fetchError } = await supabaseClient
    .from('event_photos')
    .select('id, file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (fetchError) {
    throw fetchError;
  }

  const filePaths = (photos || [])
    .map((photo: PhotoRecord) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  const { error: eventDeleteError } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (eventDeleteError) {
    throw eventDeleteError;
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

  await removeStorageObjects(supabaseClient, filePaths);
}

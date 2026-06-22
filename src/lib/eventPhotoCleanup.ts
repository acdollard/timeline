import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

function getFilePaths(photos: PhotoRecord[] | null): string[] {
  return (photos || [])
    .map((photo) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));
}

async function removePhotoFiles(
  supabaseClient: SupabaseClient,
  filePaths: string[]
): Promise<void> {
  if (filePaths.length === 0) return;

  const { error: storageError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (storageError) {
    throw storageError;
  }
}

async function bestEffortRemovePhotoFiles(
  supabaseClient: SupabaseClient,
  filePaths: string[]
): Promise<void> {
  try {
    await removePhotoFiles(supabaseClient, filePaths);
  } catch (error) {
    console.error('Failed to remove photo storage objects after database delete:', error);
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

  await bestEffortRemovePhotoFiles(supabaseClient, getFilePaths([photo]));

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

  await bestEffortRemovePhotoFiles(supabaseClient, getFilePaths(photos || []));
}

export async function deleteOwnedEventWithPhotos(
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

  const { error: eventDeleteError } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (eventDeleteError) {
    throw eventDeleteError;
  }

  const filePaths = getFilePaths(photos || []);
  await removePhotoFiles(supabaseClient, filePaths);

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
}

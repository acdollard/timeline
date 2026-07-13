import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

type FilePathRecord = {
  file_path: string | null;
};

async function removeStorageFiles(supabaseClient: SupabaseClient, filePaths: string[]): Promise<void> {
  const uniquePaths = [...new Set(filePaths)];

  if (uniquePaths.length === 0) {
    return;
  }

  const { error } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(uniquePaths);

  if (error) {
    console.warn('Failed to remove event photo storage objects after database deletion:', error);
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

  if (photo.file_path) {
    await removeStorageFiles(supabaseClient, [photo.file_path]);
  }

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

  await removeStorageFiles(supabaseClient, filePaths);
}

export async function deleteOwnedEventWithPhotos(
  supabaseClient: SupabaseClient,
  eventId: string,
  userId: string
): Promise<void> {
  const { data, error } = await supabaseClient.rpc('delete_owned_event_with_photos', {
    p_event_id: eventId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  const filePaths = ((data || []) as FilePathRecord[])
    .map((photo) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));

  await removeStorageFiles(supabaseClient, filePaths);
}

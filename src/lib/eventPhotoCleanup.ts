import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

type PhotoPathRecord = {
  file_path: string | null;
};

async function removeStorageObjects(
  supabaseClient: SupabaseClient,
  filePaths: Array<string | null | undefined>,
  context: string
): Promise<void> {
  const paths = [...new Set(filePaths.filter((filePath): filePath is string => Boolean(filePath)))];

  if (paths.length === 0) {
    return;
  }

  const { error } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(paths);

  if (error) {
    console.error(`Failed to remove ${context} storage objects after database delete:`, error);
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

  await removeStorageObjects(supabaseClient, [photo.file_path], 'photo');

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

  await removeStorageObjects(supabaseClient, filePaths, 'event photo');
}

export async function deleteEventForUser(
  supabaseClient: SupabaseClient,
  eventId: string
): Promise<void> {
  const { data, error } = await supabaseClient.rpc('delete_owned_event_with_photos', {
    target_event_id: eventId,
  });

  if (error) {
    throw error;
  }

  const filePaths = ((data || []) as PhotoPathRecord[]).map((photo) => photo.file_path);
  await removeStorageObjects(supabaseClient, filePaths, 'event');
}

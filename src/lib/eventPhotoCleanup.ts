import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'event-photos';

type PhotoRecord = {
  id: string;
  file_path: string | null;
};

type DeletedPhotoPath = {
  file_path: string | null;
};

async function removeStorageFiles(
  supabaseClient: SupabaseClient,
  filePaths: string[],
  context: string
): Promise<void> {
  if (filePaths.length === 0) {
    return;
  }

  const { error: storageError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (storageError) {
    console.error(`Failed to remove ${context} storage files:`, storageError);
  }
}

function getFilePaths(photos: DeletedPhotoPath[] | null): string[] {
  return (photos || [])
    .map((photo) => photo.file_path)
    .filter((filePath): filePath is string => Boolean(filePath));
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
    await removeStorageFiles(supabaseClient, [photo.file_path], 'deleted photo');
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

  const filePaths = getFilePaths(photos);

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

  await removeStorageFiles(supabaseClient, filePaths, 'deleted event photo');
}

export async function deleteOwnedEventWithPhotos(
  supabaseClient: SupabaseClient,
  eventId: string
): Promise<void> {
  const { data: deletedPhotos, error } = await supabaseClient.rpc(
    'delete_owned_event_with_photos',
    { p_event_id: eventId }
  );

  if (error) {
    throw error;
  }

  await removeStorageFiles(
    supabaseClient,
    getFilePaths(deletedPhotos as DeletedPhotoPath[] | null),
    'deleted event photo'
  );
}

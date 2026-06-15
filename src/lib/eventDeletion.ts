import type { SupabaseClient } from '@supabase/supabase-js';

const EVENT_PHOTOS_BUCKET = 'event-photos';

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found or access denied');
    this.name = 'EventNotFoundError';
  }
}

export async function deleteOwnedEventWithPhotos(
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
    throw new EventNotFoundError();
  }

  const { data: photos, error: photosError } = await supabaseClient
    .from('event_photos')
    .select('file_path')
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (photosError) {
    throw photosError;
  }

  const eventPhotos = photos || [];
  const filePaths = eventPhotos
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

  if (eventPhotos.length > 0) {
    const { error: photoDeleteError } = await supabaseClient
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (photoDeleteError) {
      throw photoDeleteError;
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

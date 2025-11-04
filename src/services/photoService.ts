import { supabase } from '../lib/supabase';
import type { EventPhoto, UploadPhotoResult } from '../types/eventPhotos';

/**
 * PhotoService handles all interactions between the event_photos table
 * and the event-photos storage bucket.
 * 
 * Note: uploadPhoto uses API endpoint for server-side authentication
 * Other methods may still use direct Supabase client access
 */
class PhotoService {
  private readonly BUCKET_NAME = 'event-photos';

  /**
   * Upload a photo file to storage and create a record in the database
   * 
   * @param eventId - The ID of the event this photo belongs to
   * @param file - The File object to upload
   * @param altText - Optional alt text for accessibility
   * @returns The created photo record with a signed URL
   */
  async uploadPhoto(
    eventId: string,
    file: File,
    altText?: string
  ): Promise<UploadPhotoResult> {
    // Use API endpoint for upload (handles authentication server-side)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    if (altText) {
      formData.append('altText', altText);
    }

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to upload photo' }));
      throw new Error(errorData.error || 'Failed to upload photo');
    }

    const result: UploadPhotoResult = await response.json();
    return result;


  }

  /**
   * Get all photos for an event with signed URLs
   * 
   * @param eventId - The ID of the event
   * @returns Array of photo records with signed URLs
   */
  async getPhotosByEventId(eventId: string): Promise<EventPhoto[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    // Query the table for photo metadata
    const { data: photos, error } = await supabase
      .from('event_photos')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', session.user.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Generate signed URLs for each photo
    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: urlData } = await supabase.storage
          .from(this.BUCKET_NAME)
          .createSignedUrl(photo.file_path, 3600);

        return {
          ...photo,
          url: urlData?.signedUrl || ''
        };
      })
    );

    return photosWithUrls;
  }

  /**
   * Delete a photo (removes from both table and bucket)
   * 
   * @param photoId - The ID of the photo record
   */
  async deletePhoto(photoId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    // First, get the photo record to get the file path
    const { data: photo, error: fetchError } = await supabase
      .from('event_photos')
      .select('file_path')
      .eq('id', photoId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !photo) {
      throw new Error('Photo not found or access denied');
    }

    // Delete from storage bucket first
    const { error: storageError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([photo.file_path]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
      // Continue anyway - database cleanup is more important
    }

    // Then delete the database record
    const { error: dbError } = await supabase
      .from('event_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', session.user.id);

    if (dbError) throw dbError;
  }

  /**
   * Update photo metadata (e.g., alt text, sort order)
   * 
   * @param photoId - The ID of the photo
   * @param updates - Fields to update
   */
  async updatePhoto(
    photoId: string,
    updates: Partial<Pick<EventPhoto, 'alt_text' | 'sort_order'>>
  ): Promise<EventPhoto> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('event_photos')
      .update(updates)
      .eq('id', photoId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reorder photos by updating their sort_order values
   * 
   * @param photoIds - Array of photo IDs in the desired order
   */
  async reorderPhotos(photoIds: string[]): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    // Update each photo with its new sort order
    const updates = photoIds.map((photoId, index) => 
      this.updatePhoto(photoId, { sort_order: index })
    );

    await Promise.all(updates);
  }

  /**
   * Delete all photos for an event (useful when deleting an event)
   * 
   * @param eventId - The ID of the event
   */
  async deletePhotosByEventId(eventId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated user');

    // Get all photos for this event
    const { data: photos } = await supabase
      .from('event_photos')
      .select('file_path')
      .eq('event_id', eventId)
      .eq('user_id', session.user.id);

    if (photos && photos.length > 0) {
      // Delete all files from storage
      const filePaths = photos.map(p => p.file_path);
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);
    }

    // Delete all database records
    const { error } = await supabase
      .from('event_photos')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', session.user.id);

    if (error) throw error;
  }
}

export const photoService = new PhotoService();


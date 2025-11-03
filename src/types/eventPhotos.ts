export interface EventPhoto {
  id: string;
  event_id: string;
  user_id: string;
  file_name: string;
  file_path: string; // Path in storage bucket (e.g., "{user_id}/{event_id}/{filename}")
  file_size: number; // Size in bytes
  mime_type: string; // e.g., "image/jpeg"
  alt_text?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  
  // Computed fields (not in DB, added when fetching)
  url?: string; // Signed URL from Supabase Storage
  thumbnail_url?: string; // Optional thumbnail URL
}

export interface UploadPhotoResult {
  photo: EventPhoto;
  url: string; // Signed URL for immediate display
}


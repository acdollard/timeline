-- Storage buckets cannot be created via SQL migration.
-- You must create the 'event-photos' bucket through:
-- 1. Supabase Dashboard: Storage > Create a new bucket > Name: 'event-photos' > Private
-- 2. OR via Supabase API (see instructions below)

-- This migration sets up RLS policies for the storage bucket
-- Note: These policies will work once the bucket is created

-- Enable RLS on storage.objects (if not already enabled)
-- Storage RLS is typically enabled by default, but this ensures it's set

-- Policy: Users can upload photos to their own event-photos folder structure
-- File path structure: {user_id}/{event_id}/{filename}
CREATE POLICY "Users can upload photos to their events"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own photos
CREATE POLICY "Users can view their own event photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own event photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own event photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Alternative: Simpler policy structure if you want to allow users to access all files in their user folder
-- This allows access to all photos in {user_id}/ folder regardless of event_id subfolder
-- Uncomment if the above folder structure policy doesn't work as expected:
/*
CREATE POLICY "Users can manage their event photos"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/


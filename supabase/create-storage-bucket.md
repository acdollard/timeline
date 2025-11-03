# Creating the Event Photos Storage Bucket

## Important: Bucket Creation

Storage buckets in Supabase **cannot be created via SQL migrations**. They must be created through either:

1. **Supabase Dashboard** (Recommended for initial setup)
2. **Supabase Storage API** (JavaScript/TypeScript code)

## Option 1: Create via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `event-photos`
   - **Public bucket**: ❌ **Unchecked** (keep it private for security)
   - **File size limit**: Set appropriate limit (e.g., 10MB per file)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`
5. Click **"Create bucket"**

## Option 2: Create via API (Programmatic)

You can create the bucket using a one-time script or during application initialization:

```typescript
import { supabase } from './lib/supabase';

async function createStorageBucket() {
  const { data, error } = await supabase.storage.createBucket('event-photos', {
    public: false, // Private bucket
    fileSizeLimit: 10485760, // 10MB in bytes
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  });

  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket created successfully:', data);
  }
}

// Run once to create the bucket
// createStorageBucket();
```

## After Creating the Bucket

Once the bucket is created, run the migration file:
- `20240322000000_create_storage_bucket_policies.sql`

This migration sets up the RLS policies that control who can upload, view, update, and delete photos.

## File Path Structure

The RLS policies expect files to be stored with this structure:
```
event-photos/
  └── {user_id}/
      └── {event_id}/
          └── {filename}
```

Example:
```
event-photos/
  └── 550e8400-e29b-41d4-a716-446655440000/
      └── 123e4567-e89b-12d3-a456-426614174000/
          └── vacation-photo.jpg
```

This structure ensures:
- Each user can only access their own photos
- Photos are organized by event
- Easy cleanup when events are deleted


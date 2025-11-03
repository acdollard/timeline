# How the `event_photos` Table Interacts with the `event-photos` Bucket

## Overview

The **table** and **bucket** work together but serve different purposes:

- **`event_photos` table**: Stores metadata (file paths, sizes, alt text, sort order)
- **`event-photos` bucket**: Stores actual image files

They're connected through **file paths** stored in the table.

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    UPLOAD FLOW                              │
└─────────────────────────────────────────────────────────────┘

User uploads photo
       │
       ▼
┌──────────────────┐
│  Storage Bucket  │  ← Step 1: Upload file to bucket
│  event-photos/   │     Path: {user_id}/{event_id}/{filename}
│  {user_id}/      │     Returns: Success/failure
│    {event_id}/   │
│      photo.jpg   │
└──────────────────┘
       │
       │ file_path
       ▼
┌──────────────────┐
│  event_photos     │  ← Step 2: Save metadata to table
│  table            │     - file_path (links to bucket)
│  - id             │     - file_name
│  - event_id       │     - file_size
│  - user_id        │     - mime_type
│  - file_path ─────┼─────┐
│  - file_size      │     │
│  - sort_order     │     │ Reference
└──────────────────┘     │
                         │
                         ▼
                  ┌──────────────┐
                  │ File in      │
                  │ Bucket       │
                  └──────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    READ/DISPLAY FLOW                         │
└─────────────────────────────────────────────────────────────┘

Query event photos
       │
       ▼
┌──────────────────┐
│  event_photos    │  ← Step 1: Query table for metadata
│  table            │     SELECT * WHERE event_id = '...'
│  Returns:         │
│  - file_path      │
│  - alt_text       │
│  - sort_order     │
└──────────────────┘
       │
       │ file_path
       ▼
┌──────────────────┐
│  Storage Bucket  │  ← Step 2: Generate signed URL from path
│  event-photos/   │     createSignedUrl(file_path)
│  Returns:        │
│  signed URL      │
└──────────────────┘
       │
       │ signed URL
       ▼
┌──────────────────┐
│  Display in UI   │  ← Step 3: Show image using signed URL
└──────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    DELETE FLOW                               │
└─────────────────────────────────────────────────────────────┘

Delete photo
       │
       ▼
┌──────────────────┐
│  event_photos    │  ← Step 1: Query table to get file_path
│  table            │
└──────────────────┘
       │
       │ file_path
       ▼
┌──────────────────┐
│  Storage Bucket  │  ← Step 2: Delete file from bucket
│  remove(file_path)│    remove([file_path])
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  event_photos    │  ← Step 3: Delete record from table
│  table            │     DELETE WHERE id = '...'
│  delete(id)      │
└──────────────────┘
```

## Key Concepts

### 1. File Path Structure

Files in the bucket are organized by:
```
event-photos/
  └── {user_id}/          ← User's folder
      └── {event_id}/     ← Event's folder
          └── {filename}  ← Actual file
```

The `file_path` column in the table stores this full path:
```
550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/vacation.jpg
```

### 2. Signed URLs

Since the bucket is **private**, you can't use direct URLs. Instead:
- Generate temporary signed URLs (valid for 1 hour typically)
- These URLs allow authenticated users to view photos
- The `photoService` automatically generates these when fetching photos

### 3. Two-Step Operations

Most operations involve **both** the table and bucket:

- **Upload**: Bucket first → Table second
- **Delete**: Table lookup → Bucket deletion → Table deletion
- **Read**: Table query → Generate signed URL from bucket

### 4. Data Integrity

- If a table record exists but file is missing → Broken link (404)
- If a file exists but no table record → Orphaned file (cleanup needed)
- The service handles cleanup automatically in most cases

## Example Usage

See `src/services/photoService.ts` for the complete implementation. Key methods:

```typescript
// Upload a photo (handles both bucket + table)
await photoService.uploadPhoto(eventId, file, 'Alt text');

// Get photos for an event (queries table + generates URLs)
const photos = await photoService.getPhotosByEventId(eventId);

// Delete a photo (removes from both)
await photoService.deletePhoto(photoId);
```


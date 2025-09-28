-- Debug script to test RLS policies and joins
-- This will help identify if the RLS policy is working correctly

-- First, let's check what event_types exist and their ownership
SELECT 
  et.id,
  et.name,
  et.display_name,
  et.color,
  et.is_default,
  et.user_id,
  CASE 
    WHEN et.is_default = true THEN 'Default'
    WHEN et.user_id IS NULL THEN 'No Owner'
    ELSE 'Custom'
  END as type_category
FROM event_types et
ORDER BY et.is_default DESC, et.created_at;

-- Check if there are any events with event_type_id that don't have matching event_types
SELECT 
  e.id as event_id,
  e.name as event_name,
  e.event_type_id,
  e.user_id as event_user_id,
  et.id as event_type_exists,
  et.name as event_type_name,
  et.is_default,
  et.user_id as event_type_user_id
FROM events e
LEFT JOIN event_types et ON e.event_type_id = et.id
WHERE e.event_type_id IS NOT NULL
ORDER BY e.created_at;

-- Test the RLS policy by trying to select event_types that should be visible
-- This simulates what happens during a join
SELECT 
  et.id,
  et.name,
  et.display_name,
  et.color,
  et.is_default,
  et.user_id,
  'Should be visible' as visibility_status
FROM event_types et
WHERE (
  et.is_default = true 
  OR et.user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM events e
    WHERE e.event_type_id = et.id 
    AND e.user_id = auth.uid()
  )
)
ORDER BY et.is_default DESC, et.created_at;

-- Update existing events to reference the correct event types
-- This query joins the events table with event_types table on the type name
UPDATE events 
SET event_type_id = et.id
FROM event_types et
WHERE events.type = et.name 
  AND et.is_default = true
  AND events.event_type_id IS NULL;

-- Verify the update worked by checking for any events that still don't have an event_type_id
-- This will help identify any events with types that don't exist in event_types table
SELECT 
  e.id,
  e.name,
  e.type,
  e.event_type_id,
  CASE 
    WHEN e.event_type_id IS NULL THEN 'MISSING EVENT TYPE'
    ELSE 'OK'
  END as status
FROM events e
WHERE e.event_type_id IS NULL;

-- Optional: If you want to see the mapping that was created
SELECT 
  e.id as event_id,
  e.name as event_name,
  e.type as event_type_name,
  et.id as event_type_id,
  et.name as event_type_name,
  et.display_name as event_type_display_name
FROM events e
JOIN event_types et ON e.event_type_id = et.id
ORDER BY e.created_at; 
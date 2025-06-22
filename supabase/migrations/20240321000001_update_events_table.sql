-- Add event_type_id column to events table
ALTER TABLE events ADD COLUMN event_type_id UUID REFERENCES event_types(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX idx_events_event_type_id ON events(event_type_id);

-- Update existing events to reference default event types
UPDATE events 
SET event_type_id = (
  SELECT id 
  FROM event_types 
  WHERE event_types.name = events.type 
  AND event_types.is_default = true
);

-- Make event_type_id NOT NULL after populating data
ALTER TABLE events ALTER COLUMN event_type_id SET NOT NULL;

-- Drop the old type column (optional - you might want to keep it for backward compatibility)
-- ALTER TABLE events DROP COLUMN type;

-- Update RLS policies to include event_type_id
DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON events;
CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON events;
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own events" ON events;
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id); 
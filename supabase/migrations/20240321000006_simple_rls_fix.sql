-- Simple RLS policy fix
-- The issue might be that we're overcomplicating the RLS policy
-- Let's try a much simpler approach

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view default and own event types" ON event_types;
DROP POLICY IF EXISTS "Users can view event types referenced by their events" ON event_types;

-- Create a single, simple policy that allows access to:
-- 1. Default event types (for everyone)
-- 2. Custom event types owned by the user
-- 3. Custom event types that are referenced by the user's events
CREATE POLICY "event_types_select_policy"
  ON event_types FOR SELECT
  USING (
    -- Default event types are visible to everyone
    is_default = true
    OR 
    -- Custom event types owned by the current user
    user_id = auth.uid()
    OR
    -- Custom event types referenced by events owned by the current user
    id IN (
      SELECT event_type_id 
      FROM events 
      WHERE user_id = auth.uid() 
      AND event_type_id IS NOT NULL
    )
  );

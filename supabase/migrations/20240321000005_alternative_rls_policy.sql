-- Alternative RLS policy approach
-- Sometimes EXISTS subqueries in RLS policies can cause issues
-- This approach uses a different strategy

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view default and own event types" ON event_types;

-- Create a simpler policy that should work better with joins
-- The key insight is that if a user can see an event, they should be able to see its event_type
CREATE POLICY "Users can view default and own event types"
  ON event_types FOR SELECT
  USING (
    is_default = true 
    OR user_id = auth.uid()
  );

-- Add a separate policy for joins from events
-- This allows event_types to be accessed when they're referenced by user's events
CREATE POLICY "Users can view event types referenced by their events"
  ON event_types FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT event_type_id 
      FROM events 
      WHERE user_id = auth.uid() 
      AND event_type_id IS NOT NULL
    )
  );

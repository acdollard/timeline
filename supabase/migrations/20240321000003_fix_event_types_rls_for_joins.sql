-- Fix RLS policy for event_types to allow joins from user's own events
-- This allows users to see event_types when they're joined from their own events

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view default and own event types" ON event_types;

-- Create a new policy that allows access to event_types when:
-- 1. The event_type is a default type (is_default = true), OR
-- 2. The event_type belongs to the current user (user_id = auth.uid()), OR  
-- 3. The event_type is being accessed through a join from an event that belongs to the current user
CREATE POLICY "Users can view default and own event types"
  ON event_types FOR SELECT
  USING (
    is_default = true 
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.event_type_id = event_types.id 
      AND events.user_id = auth.uid()
    )
  );

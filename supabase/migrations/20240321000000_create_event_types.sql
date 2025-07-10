-- Create event_types table
CREATE TABLE event_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
  icon VARCHAR(50), -- Optional icon identifier
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for default types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_event_types_user_id ON event_types(user_id);
CREATE INDEX idx_event_types_is_default ON event_types(is_default);
CREATE INDEX idx_event_types_is_active ON event_types(is_active);

-- Insert default event types
INSERT INTO event_types (name, display_name, color, icon, is_default, is_active) VALUES
  ('birth', 'Birth', '#EF4444', 'baby', true, true),
  ('school', 'School', '#10B981', 'graduation-cap', true, true),
  ('travel', 'Travel', '#F59E0B', 'plane', true, true),
  ('relationships', 'Relationships', '#EC4899', 'heart', true, true),
  ('move', 'Move', '#8B5CF6', 'home', true, true),
  ('career', 'Career', '#06B6D4', 'briefcase', true, true),
  ('bucket-list', 'Bucket List', '#F97316', 'star', true, true),
  ('hobbies', 'Hobbies', '#6366F1', 'gamepad', true, true);

-- Enable RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_types
-- Users can view default event types and their own custom types
CREATE POLICY "Users can view default and own event types"
  ON event_types FOR SELECT
  USING (is_default = true OR auth.uid() = user_id);

-- Users can create their own event types
CREATE POLICY "Users can create their own event types"
  ON event_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own event types
CREATE POLICY "Users can update their own event types"
  ON event_types FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own event types
CREATE POLICY "Users can delete their own event types"
  ON event_types FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 


  -- Add new event types with easily discernable colors
INSERT INTO event_types (name, display_name, color, icon, is_default, is_active) VALUES
  ('medical-dental', 'Medical/Dental', '#DC2626', 'stethoscope', true, true),
  ('military', 'Military', '#059669', 'shield', true, true),
  ('milestones', 'Milestones', '#7C3AED', 'trophy', true, true);
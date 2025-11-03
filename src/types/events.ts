import type { EventType } from '../types/eventTypes';
import type { EventPhoto } from './eventPhotos';

export interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  type?: string; // Legacy field for backward compatibility
  event_type_id: string; // New field referencing event_types table
  event_types?: EventType; // Joined event type data
  photos?: EventPhoto[]; // Photos associated with this event
  position?: number;
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
} 
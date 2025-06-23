import type { EventType } from '../types/eventTypes';

// Legacy type for backward compatibility
export type LegacyEventType = 'birth' | 'school' | 'travel' | 'relationships' | 'move' | 'career' | 'bucket-list' | 'hobbies' | string;

// Default color mapping for backward compatibility
const DEFAULT_COLORS: Record<string, string> = {
  'birth': '#EF4444',
  'school': '#10B981',
  'travel': '#F59E0B',
  'relationships': '#EC4899',
  'move': '#8B5CF6',
  'career': '#06B6D4',
  'bucket-list': '#F97316',
  'hobbies': '#6366F1'
};

// Get color for event type - supports both legacy string types and new EventType objects
export const getPinColor = (eventType: string | EventType): string => {
  if (typeof eventType === 'string') {
    // Legacy support for string-based event types
    return DEFAULT_COLORS[eventType] || '#c2c2c2';
  } else {
    // New EventType object with custom colors
    return eventType.color || '#c2c2c2';
  }
};

// Legacy event types array for backward compatibility
export const EVENT_TYPES: LegacyEventType[] = [
  'birth',
  'school',
  'travel',
  'relationships',
  'move',
  'career',
  'bucket-list',
  'hobbies'
];

// Get display name for event type
export const getEventTypeDisplayName = (eventType: string | EventType): string => {
  if (typeof eventType === 'string') {
    // Legacy support - convert kebab-case to Title Case
    return eventType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  } else {
    // New EventType object with display name
    return eventType.displayName;
  }
};

// Get icon for event type
export const getEventTypeIcon = (eventType: string | EventType): string | undefined => {
  if (typeof eventType === 'string') {
    // Legacy support - no icons for string types
    return undefined;
  } else {
    // New EventType object with icon
    return eventType.icon;
  }
}; 
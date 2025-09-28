import type { EventType } from '../types/eventTypes';

// Default color mapping for legacy event types (fallback only)
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

/**
 * Get color for event type - supports both legacy string types and new EventType objects
 * This is primarily used as a fallback when event_types data is not available
 */
export const getPinColor = (eventType: string | EventType): string => {
  if (typeof eventType === 'string') {
    // Legacy support for string-based event types (fallback only)
    return DEFAULT_COLORS[eventType] || '#c2c2c2';
  } else {
    // New EventType object with custom colors
    return eventType.color || '#c2c2c2';
  }
}; 
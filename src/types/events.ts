import type { EventType } from '../utils/pinColors';

export interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: EventType;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
} 
export interface EventType {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventTypeRequest {
  name: string;
  displayName: string;
  color: string;
  icon?: string;
}

export interface UpdateEventTypeRequest {
  displayName?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
} 
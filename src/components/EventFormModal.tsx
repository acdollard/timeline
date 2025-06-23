import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialEvent?: TimelineEvent;
}

const EventFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialEvent }: EventFormModalProps) => {
  const [formData, setFormData] = useState<Omit<TimelineEvent, 'id'>>({
    name: '',
    date: '',
    event_type_id: '',
    type: '',
    description: ''
  });
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch event types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEventTypes();
    }
  }, [isOpen]);

  const fetchEventTypes = async () => {
    try {
      const response = await fetch('/api/event-types');
      if (!response.ok) {
        throw new Error('Failed to fetch event types');
      }
      const data = await response.json();
      setEventTypes(data);
      
      // Set default event type if none is selected
      if (!formData.event_type_id && data.length > 0) {
        const birthType = data.find((type: EventType) => type.name === 'birth');
        if (birthType) {
          setFormData(prev => ({ 
            ...prev, 
            event_type_id: birthType.id,
            type: birthType.name
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    }
  };

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        name: initialEvent.name,
        date: initialEvent.date,
        event_type_id: initialEvent.event_type_id || '',
        type: initialEvent.type || '',
        description: initialEvent.description || ''
      });
    } else {
      // Reset form for new events
      setFormData({
        name: '',
        date: '',
        event_type_id: '',
        type: '',
        description: ''
      });
    }
  }, [initialEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_type_id) {
      alert('Please select an event type');
      return;
    }
    
    try {
      setIsLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (initialEvent && onDelete) {
      try {
        setIsLoading(true);
        await onDelete(initialEvent.id);
        onClose();
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-white text-xl font-semibold mb-4">
          {initialEvent ? 'Update Event' : 'Create New Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Date</label>
            <input
              type="date"
              value={formData.date?.split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Type</label>
            <select
              value={formData.event_type_id}
              onChange={(e) => {
                const selectedType = eventTypes.find(type => type.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  event_type_id: e.target.value,
                  type: selectedType?.name || ''
                });
              }}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            >
              <option value="">Select an event type</option>
              {eventTypes
                .filter((type: EventType) => type.name !== 'birth')
                .map((type: EventType) => (
                  <option key={type.id} value={type.id}>
                    {type.displayName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (initialEvent ? 'Update Event' : 'Create Event')}
            </button>
            {initialEvent && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Event
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal; 
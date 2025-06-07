import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../utils/pinColors';
import { EVENT_TYPES } from '../utils/pinColors';
import CustomSelect from './CustomSelect';

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
    type: 'birth',
    description: ''
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        name: initialEvent.name,
        date: initialEvent.date,
        type: initialEvent.type,
        description: initialEvent.description
      });
    }
  }, [initialEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleDelete = async () => {
    if (initialEvent && onDelete) {
      try {
        await onDelete(initialEvent.id);
        onClose();
      } catch (error) {
        // Error is handled by the parent component
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
              value={formData.date.split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            >
              {EVENT_TYPES.map((type: EventType) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              {initialEvent ? 'Update Event' : 'Create Event'}
            </button>
            {initialEvent && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Event
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
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
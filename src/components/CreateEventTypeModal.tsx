import React, { useState } from 'react';
import type { CreateEventTypeRequest } from '../types/eventTypes';

interface CreateEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventType: any) => void;
}

const CreateEventTypeModal = ({ isOpen, onClose, onSuccess }: CreateEventTypeModalProps) => {
  const [formData, setFormData] = useState<CreateEventTypeRequest>({
    name: '',
    displayName: '',
    color: '#3B82F6',
    icon: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
  ];

  const predefinedIcons = [
    'star', 'heart', 'trophy', 'gift', 'cake', 'music', 'camera',
    'book', 'gamepad', 'car', 'home', 'briefcase', 'graduation-cap',
    'plane', 'ship', 'bicycle', 'football', 'basketball', 'swimming',
    'paint-brush', 'code', 'wrench', 'lightbulb', 'fire', 'leaf'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Generate a URL-friendly name from displayName if name is empty
      const name = formData.name || formData.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      const response = await fetch('/api/event-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event type');
      }

      const newEventType = await response.json();
      onSuccess(newEventType);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        displayName: '',
        color: '#3B82F6',
        icon: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError(null);
      setFormData({
        name: '',
        displayName: '',
        color: '#3B82F6',
        icon: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-xl font-semibold mb-4">
          Create Custom Event Type
        </h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Display Name *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="e.g., Graduation, Wedding, Promotion"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">Color *</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-600"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
                placeholder="#3B82F6"
              />
            </div>
            <div className="grid grid-cols-10 gap-1 mt-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

        

          <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-600 text-white px-4 py-3 sm:py-2 rounded hover:bg-gray-700 disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.displayName}
              className="bg-primary text-white px-4 py-3 sm:py-2 rounded hover:bg-primary/90 disabled:opacity-50 text-center"
            >
              {isLoading ? 'Creating...' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventTypeModal;

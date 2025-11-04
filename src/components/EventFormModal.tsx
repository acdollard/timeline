import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';
import CreateEventTypeModal from './CreateEventTypeModal';
import PhotoUpload from './PhotoUpload';
import { photoService } from '../services/photoService';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<TimelineEvent, 'id'>) => Promise<TimelineEvent | void>;
  onDelete?: (id: string) => Promise<void>;
  initialEvent?: TimelineEvent;
  eventTypes: EventType[];
  onRefreshEventTypes?: () => void;
  onRefreshEvents?: () => void; // Callback to refresh events list after photo upload
}

const EventFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialEvent, eventTypes, onRefreshEventTypes, onRefreshEvents }: EventFormModalProps) => {
  const [formData, setFormData] = useState<Omit<TimelineEvent, 'id'>>({
    name: '',
    date: '',
    event_type_id: '',
    type: '',
    description: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [showCreateEventTypeModal, setShowCreateEventTypeModal] = useState(false);

  // Set default event type if none is selected when modal opens
  useEffect(() => {
    if (isOpen && !formData.event_type_id && eventTypes.length > 0) {
      const birthType = eventTypes.find((type: EventType) => type.name === 'birth');
      if (birthType) {
        setFormData(prev => ({ 
          ...prev, 
          event_type_id: birthType.id,
          type: birthType.name
        }));
      }
    }
  }, [isOpen, eventTypes]);

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        name: initialEvent.name,
        date: initialEvent.date,
        event_type_id: initialEvent.event_type_id || '',
        type: initialEvent.type || '',
        description: initialEvent.description || ''
      });
      // Don't load photos for editing in this implementation
      // Photos can be managed separately after event creation
      setPhotos([]);
    } else {
      // Reset form for new events
      setFormData({
        name: '',
        date: '',
        event_type_id: '',
        type: '',
        description: ''
      });
      setPhotos([]);
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
      
      // Step 1: Create or update the event
      const resultEvent = await onSubmit(formData);
      
      // Step 2: Upload photos if any were selected
      if (photos.length > 0) {
        const eventId = initialEvent?.id || (resultEvent?.id);
        
        if (eventId) {
          setIsUploadingPhotos(true);
          try {
            // Upload photos sequentially to avoid overwhelming the server
            for (const photo of photos) {
              await photoService.uploadPhoto(eventId, photo);
            }
            // Refresh events after photos are uploaded to show them immediately
            if (onRefreshEvents) {
              await onRefreshEvents();
            }
          } catch (photoError) {
            console.error('Error uploading photos:', photoError);
            // Don't fail the entire operation if photo upload fails
            const action = initialEvent ? 'updated' : 'created';
            alert(`Event ${action}, but some photos failed to upload. You can add them later.`);
          } finally {
            setIsUploadingPhotos(false);
          }
        }
      }
      
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

  const handleCreateEventTypeSuccess = (newEventType: EventType) => {
    // Automatically select the new event type
    setFormData(prev => ({
      ...prev,
      event_type_id: newEventType.id,
      type: newEventType.name
    }));
    
    // Refresh event types in the parent component
    if (onRefreshEventTypes) {
      onRefreshEventTypes();
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
                if (e.target.value === 'create-custom') {
                  setShowCreateEventTypeModal(true);
                  return;
                }
                
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
              <option value="create-custom" className="text-primary font-semibold">
                + Create Custom Event Type
              </option>
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
          
          {/* Photo Upload Section - Available for both create and update */}
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={10}
            maxFileSize={10 * 1024 * 1024} // 10MB
          />
          
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={isLoading || isUploadingPhotos}
              className="bg-primary text-white px-4 py-3 sm:py-2 rounded hover:bg-primary/90 disabled:opacity-50 text-center order-1 sm:order-1"
            >
              {isUploadingPhotos 
                ? 'Uploading photos...' 
                : isLoading 
                  ? 'Saving...' 
                  : (initialEvent ? 'Update Event' : 'Create Event')
              }
            </button>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-2 sm:order-2">
              {initialEvent && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-3 sm:py-2 rounded hover:bg-red-700 disabled:opacity-50 text-center"
                >
                  Delete Event
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-gray-600 text-white px-4 py-3 sm:py-2 rounded hover:bg-gray-700 disabled:opacity-50 text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <CreateEventTypeModal
        isOpen={showCreateEventTypeModal}
        onClose={() => setShowCreateEventTypeModal(false)}
        onSuccess={handleCreateEventTypeSuccess}
      />
    </div>
  );
};

export default EventFormModal; 
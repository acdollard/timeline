import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';
import type { EventType } from '../types/eventTypes';
import type { EventPhoto } from '../types/eventPhotos';
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
  const [existingPhotos, setExistingPhotos] = useState<EventPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);
  const [isCompressingUploads, setIsCompressingUploads] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
  }, [isOpen, eventTypes, formData.event_type_id]);

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        name: initialEvent.name,
        date: initialEvent.date,
        event_type_id: initialEvent.event_type_id || '',
        type: initialEvent.type || '',
        description: initialEvent.description || ''
      });
      const sortedPhotos = (initialEvent.photos || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setExistingPhotos(sortedPhotos);
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
      setExistingPhotos([]);
      setPhotos([]);
    }
  }, [initialEvent]);

  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
    }
  }, [isOpen]);

  const handleDeleteExistingPhoto = async (photoId: string) => {
    try {
      setFormError(null);
      setIsManagingPhotos(true);
      await photoService.deletePhoto(photoId);
      setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
      if (onRefreshEvents) {
        try {
          await onRefreshEvents();
        } catch (refreshError) {
          console.error('Failed to refresh events after photo delete:', refreshError);
          setFormError('Photo removed locally, but failed to refresh events. Try reloading.');
        }
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      setFormError('Failed to delete photo. Please try again.');
    } finally {
      setIsManagingPhotos(false);
    }
  };

  const handleMoveExistingPhoto = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= existingPhotos.length) return;

    const newOrder = [...existingPhotos];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

    try {
      setFormError(null);
      setIsManagingPhotos(true);
      const orderedIds = newOrder.map(photo => photo.id);
      await photoService.reorderPhotos(orderedIds);
      setExistingPhotos(newOrder);
      if (onRefreshEvents) {
        try {
          await onRefreshEvents();
        } catch (refreshError) {
          console.error('Failed to refresh events after reorder:', refreshError);
          setFormError('Order updated locally, but failed to refresh events. Try reloading.');
        }
      }
    } catch (error) {
      console.error('Failed to reorder photos:', error);
      setFormError('Failed to reorder photos. Please try again.');
    } finally {
      setIsManagingPhotos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_type_id) {
      setFormError('Please select an event type.');
      return;
    }
    
    try {
      setFormError(null);
      setIsLoading(true);
      
      const resultEvent = await onSubmit(formData);
      const eventId = initialEvent?.id || (resultEvent && 'id' in resultEvent ? resultEvent.id : undefined);

      if (!initialEvent && !eventId) {
        throw new Error('Event ID missing after create');
      }
      
      if (photos.length > 0 && eventId) {
        setIsUploadingPhotos(true);
        try {
          for (const photo of photos) {
            const uploaded = await photoService.uploadPhoto(eventId, photo);
            if (initialEvent) {
              setExistingPhotos(prev => [...prev, uploaded.photo]);
            }
          }
          if (onRefreshEvents) {
            try {
              await onRefreshEvents();
            } catch (refreshError) {
              console.error('Failed to refresh events after upload:', refreshError);
              setFormError('Photos uploaded, but refreshing events failed. Try reloading.');
            }
          }
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
          const action = initialEvent ? 'updated' : 'created';
          setFormError(`Event ${action}, but some photos failed to upload. You can add them later.`);
        } finally {
          setIsUploadingPhotos(false);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to submit event:', error);
      setFormError('Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (initialEvent && onDelete) {
      try {
        setFormError(null);
        setIsLoading(true);
        await onDelete(initialEvent.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
        setFormError('Failed to delete event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateEventTypeSuccess = (newEventType: EventType) => {
    setFormData(prev => ({
      ...prev,
      event_type_id: newEventType.id,
      type: newEventType.name
    }));
    
    if (onRefreshEventTypes) {
      try {
        onRefreshEventTypes();
      } catch (error) {
        console.error('Failed to refresh event types:', error);
        setFormError('Created type, but failed to refresh the type list.');
      }
    }
  };

  const isActionDisabled = isLoading || isUploadingPhotos || isManagingPhotos || isCompressingUploads;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-white text-xl font-semibold mb-4">
          {initialEvent ? 'Update Event' : 'Create New Event'}
        </h2>
        {formError && (
          <div className="mb-4 bg-red-900/50 border border-red-600 text-red-200 px-3 py-2 rounded text-sm">
            {formError}
          </div>
        )}
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

          {/* Existing Photos Section */}
          {initialEvent && existingPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-medium uppercase tracking-wide">Existing Photos</h3>
                {isManagingPhotos && (
                  <span className="text-xs text-gray-400">Saving changes...</span>
                )}
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {existingPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="flex items-center space-x-3 bg-gray-900/80 border border-gray-700 rounded-lg p-3"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt_text || `Photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 text-sm text-gray-300">
                      <p className="font-medium text-white">Photo {index + 1}</p>
                      {photo.alt_text && (
                        <p className="text-gray-400 text-xs">{photo.alt_text}</p>
                      )}
                      <p className="text-gray-500 text-xs">Size: {Math.round((photo.file_size || 0) / 1024)} KB</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleMoveExistingPhoto(index, 'up')}
                          disabled={index === 0 || isActionDisabled}
                          className={`p-2 rounded bg-gray-700 hover:bg-gray-600 text-white ${index === 0 || isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Move photo up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExistingPhoto(index, 'down')}
                          disabled={index === existingPhotos.length - 1 || isActionDisabled}
                          className={`p-2 rounded bg-gray-700 hover:bg-gray-600 text-white ${index === existingPhotos.length - 1 || isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Move photo down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingPhoto(photo.id)}
                        disabled={isActionDisabled}
                        className={`px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Photo Upload Section - Available for both create and update */}
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={10}
            maxFileSize={10 * 1024 * 1024} // 10MB
            compressionOptions={{ maxWidth: 1800, maxHeight: 1800, quality: 0.85, maxOutputSizeBytes: 8 * 1024 * 1024 }}
            onCompressingChange={setIsCompressingUploads}
          />
          
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={isActionDisabled}
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
                  disabled={isActionDisabled}
                  className="bg-red-600 text-white px-4 py-3 sm:py-2 rounded hover:bg-red-700 disabled:opacity-50 text-center"
                >
                  Delete Event
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isActionDisabled}
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
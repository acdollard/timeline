import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';

interface EventModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onUpdate }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Reset photo index when event changes or modal opens
  useEffect(() => {
    if (isOpen && event) {
      setSelectedPhotoIndex(0);
    }
  }, [event?.id, isOpen]);

  if (!isOpen || !event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getEventColor = (): string => {
    if (event.event_types?.color) {
      return event.event_types.color;
    } else {
      return '#f2f2f2';
    }
  };

  const photos = event.photos || [];
  const hasPhotos = photos.length > 0;
  const currentPhoto = photos[selectedPhotoIndex];

  const nextPhoto = () => {
    if (photos.length > 0) {
      setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full mx-auto relative my-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white p-2 bg-gray-800/80 rounded-full backdrop-blur-sm transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Journal-style Layout */}
        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          {/* Photo Section - Takes up significant space */}
          {hasPhotos && (
            <div className="lg:w-2/3 bg-gray-900 p-6 lg:p-8 flex flex-col">
              {/* Main Photo Display */}
              <div className="relative flex-1 flex items-center justify-center bg-gray-950 rounded-lg overflow-hidden border-2 border-gray-700 shadow-inner">
                {currentPhoto?.url && (
                  <>
                    <img
                      src={currentPhoto.url}
                      alt={currentPhoto.alt_text || event.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {/* Photo Navigation Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                          aria-label="Previous photo"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                          aria-label="Next photo"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedPhotoIndex
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-gray-700 hover:border-gray-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {photo.url && (
                        <img
                          src={photo.url}
                          alt={photo.alt_text || `Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Photo Counter */}
              {photos.length > 1 && (
                <div className="mt-2 text-center text-gray-400 text-sm">
                  {selectedPhotoIndex + 1} of {photos.length}
                </div>
              )}
            </div>
          )}

          {/* Content Section - Journal entry style */}
          <div className={`${hasPhotos ? 'lg:w-1/3' : 'w-full'} bg-gray-800 p-6 lg:p-8 flex flex-col ${hasPhotos ? 'border-t lg:border-t-0 lg:border-l border-gray-700' : ''}`}>
            {/* Header with Event Type Color */}
            <div className="mb-6 pb-4 border-b border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-5 h-5 rounded-full flex-shrink-0`} style={{ backgroundColor: getEventColor() }} />
                <h2 className="text-2xl font-semibold text-white">{event.name}</h2>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formattedDate}</span>
                </div>
                
                {event.event_types?.displayName && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span className="text-gray-500">•</span>
                    <span className="capitalize">{event.event_types.displayName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description - Journal entry style */}
            {event.description && (
              <div className="flex-1 mb-6">
                <p className="text-white leading-relaxed text-base whitespace-pre-wrap font-light">
                  {event.description}
                </p>
              </div>
            )}

            {/* Photo Count Badge */}
            {hasPhotos && (
              <div className="mb-6 flex items-center space-x-2 text-gray-400 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={onUpdate}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-center font-medium"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 text-gray-400 hover:text-white transition-colors text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 
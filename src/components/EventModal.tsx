import React from 'react';
import { getPinColor } from '../utils/pinColors';
import type { EventType } from '../utils/pinColors';
import type { TimelineEvent } from '../types/events';

interface EventModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 md:mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-4 h-4 rounded-full ${getPinColor(event.type)}`} />
          <h2 className="text-xl font-semibold text-white">{event.name}</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Date</p>
            <p className="text-white">{formattedDate}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Type</p>
            <p className="text-white capitalize">{event.type.replace('-', ' ')}</p>
          </div>
          
          {event.description && (
            <div>
              <p className="text-gray-400 text-sm">Description</p>
              <p className="text-white">{event.description}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 
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

const EventModal = ({ event, isOpen, onClose, onUpdate }: EventModalProps) => {
  if (!isOpen || !event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">{event.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Date</p>
            <p className="text-white">{formattedDate}</p>
          </div>
          <div>
            <p className="text-gray-400">Type</p>
            <p className="text-white capitalize">{event.type.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-gray-400">Description</p>
            <p className="text-white">{event.description}</p>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onUpdate}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Update Event
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 
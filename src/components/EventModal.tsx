import React from 'react';
import { getPinColor } from '../utils/pinColors';
import type { EventType } from '../utils/pinColors';

interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  type: EventType;
}

interface EventModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formattedDate = new Date(event?.date || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 w-full h-full">   
      <div className="bg-gray-900 rounded-lg p-8 w-[90%] mx-4 absolute md:w-[900px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
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
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">{event?.name}</h2>
          <div className="text-gray-300 text-lg">{formattedDate}</div>
          <div className="text-gray-400 text-lg leading-relaxed">{event?.description}</div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${getPinColor(event?.type || 'birth')}`} />
            <span className="text-gray-300 capitalize text-lg">{event?.type.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
      </div>
  );
};

export default EventModal; 
import React, { useState } from 'react';
import type { EventType } from '../utils/pinColors';

interface TimelineFiltersProps {
  onFilterChange: (selectedTypes: EventType[]) => void;
  onAddClick: () => void;
  children?: React.ReactNode;
}

const eventTypes: EventType[] = [
  'birth',
  'school',
  'travel',
  'relationships',
  'move',
  'career',
  'pets',
  'bucket-list',
  'hobbies'
];

const TimelineFilters = ({ onFilterChange, onAddClick }: TimelineFiltersProps) => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(eventTypes);
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeToggle = (type: EventType) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    onFilterChange(newSelectedTypes);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-white hover:text-gray-300"
          >
            <span>Filter Events</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg p-4 min-w-[800px]">
              <h1 className="text-white text-2xl font-bold mx-auto text-center mb-4">Select Category To Display</h1>
              <div className="grid grid-cols-5 gap-2">
                {eventTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineFilters; 
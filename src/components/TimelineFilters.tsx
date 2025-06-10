import React, { useState } from 'react';
import { getPinColor } from '../utils/pinColors';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeToggle = (type: EventType) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    onFilterChange(newSelectedTypes);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 transition-all duration-300 ease-in-out"
         style={{ 
           height: isExpanded ? 'auto' : '4rem',
           overflow: 'hidden'
         }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-white text-xl font-semibold">Select Categories To Display</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button
            onClick={onAddClick}
            className="bg-primary hover:bg-white text-white hover:text-primary px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
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
        
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          {eventTypes.map(type => ( type !== 'birth' &&
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                selectedTypes.includes(type)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${getPinColor(type)}`} />
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters; 
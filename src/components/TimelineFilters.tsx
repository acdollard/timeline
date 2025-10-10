import React, { useState, useEffect } from 'react';
import type { EventType } from '../types/eventTypes';

interface TimelineFiltersProps {
  eventTypes: EventType[];
  onFilterChange: (selectedTypes: string[]) => void;
  onAddClick: () => void;
  onAddEventTypeClick: () => void;
  children?: React.ReactNode;
}

const TimelineFilters = ({ eventTypes, onFilterChange, onAddClick, onAddEventTypeClick }: TimelineFiltersProps) => {
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // On mobile, start collapsed by default
      if (mobile) {
        setIsExpanded(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize with no event types selected (show all by default) when eventTypes change
  useEffect(() => {
    if (eventTypes.length > 0) {
      setSelectedTypeIds([]);
      onFilterChange([]);
    }
  }, [eventTypes]);

  const handleTypeToggle = (typeId: string) => {
    console.log('handleTypeToggle', typeId);
    // If this type is already selected, deselect it (show all)
    // If this type is not selected, select only this type (show only this type)
    const newSelectedTypeIds = selectedTypeIds.includes(typeId)
      ? [] // Deselect all (show all events)
      : [typeId]; // Select only this type (show only this type)
    
    setSelectedTypeIds(newSelectedTypeIds);
    onFilterChange(newSelectedTypeIds);
  };


  // Separate default and custom event types, and organize them properly
  const birthEvent = eventTypes.find((type: EventType) => type.name === 'birth');
  const otherDefaultEvents = eventTypes.filter((type: EventType) => type.isDefault && type.name !== 'birth');
  const customEventTypes = eventTypes.filter((type: EventType) => !type.isDefault);
  
  // Combine birth event with other default events
  const defaultEventTypes = birthEvent ? [birthEvent, ...otherDefaultEvents] : otherDefaultEvents;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 transition-all duration-300 ease-in-out"
         style={{ 
           height: isExpanded ? (isMobile ? '70vh' : 'auto') : isMobile ? '3rem' : '4rem',
           overflow: 'hidden'
         }}>
      <div className="max-w-screen-xl mx-auto h-full flex flex-col">
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center ${isMobile ? 'p-2' : 'p-4'} flex-shrink-0`}>
          <div className={`flex items-center ${isMobile ? 'w-full justify-between' : 'space-x-3'}`}>
            <div className="flex items-center space-x-2">
              <h2 className={`text-white ${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Event Categories</h2>
              {selectedTypeIds.length > 0 && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  {isMobile ? 'Filtered' : `Showing only ${eventTypes.find(t => t.id === selectedTypeIds[0])?.displayName}`}
                </span>
              )}
              {selectedTypeIds.length === 0 && (
                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                  All events
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
            className={`bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} rounded-lg flex items-center space-x-2 transition-colors ${isMobile ? 'mt-2 w-full justify-center' : ''}`}
          >
            <svg
              className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{isMobile ? 'Add' : 'Add Event'}</span>
          </button>
        </div>
        
        <div className={`${isExpanded ? 'flex-1 overflow-y-auto' : ''}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-4 gap-${isMobile ? '2' : '4'} ${isMobile ? 'p-2' : 'p-4'} transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          {/* Default Event Types */}
          {otherDefaultEvents.map(type => (
            <button
              key={type.id}
              onClick={() => type.name !== 'birth' && handleTypeToggle(type.id)}
              className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2'} ${isMobile ? 'px-4 py-3' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${
                type.name === 'birth' 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' // Birth events are always selected and non-toggleable
                  : selectedTypeIds.includes(type.id)
                    ? 'bg-primary text-white' // Selected - show only this type
                    : selectedTypeIds.length === 0
                      ? 'bg-gray-700 text-white' // No selection - show all (this type is visible)
                      : 'text-gray-400 hover:text-white hover:bg-gray-800' // Not selected - this type is hidden
              }`}
              disabled={type.name === 'birth'}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-full`} 
                  style={{ backgroundColor: type.color }}
                />
                <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>{type.displayName}</span>
              </div>
              <div className="flex items-center space-x-1">
                {type.name === 'birth' && (
                  <span className="text-xs text-gray-400">(Required)</span>
                )}
                {selectedTypeIds.includes(type.id) && type.name !== 'birth' && (
                  <span className="text-xs text-gray-300">(Only)</span>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={onAddEventTypeClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 bg-gray-700 text-white hover:bg-gray-800 hover:text-white"
          >
                        <svg
              className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Custom Event</span>
          </button>
          
          {/* Custom Event Types */}
          {customEventTypes.length > 0 && (
            <>
              {customEventTypes.length > 0 && defaultEventTypes.length > 0 && (
                <div className="col-span-full border-t border-gray-700 my-2"></div>
              )}
              {customEventTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2'} ${isMobile ? 'px-4 py-3' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${
                    selectedTypeIds.includes(type.id)
                      ? 'bg-primary text-white' // Selected - show only this type
                      : selectedTypeIds.length === 0
                        ? 'bg-gray-700 text-white' // No selection - show all (this type is visible)
                        : 'text-gray-400 hover:text-white hover:bg-gray-800' // Not selected - this type is hidden
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-full`} 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>{type.displayName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">(Custom)</span>
                    {selectedTypeIds.includes(type.id) && (
                      <span className="text-xs text-gray-300">(Only)</span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters; 
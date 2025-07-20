import React, { useState, useEffect } from 'react';
import type { EventType } from '../types/eventTypes';
import { logger } from '../utils/logger';

interface TimelineFiltersProps {
  onFilterChange: (selectedTypes: string[]) => void;
  onAddClick: () => void;
  children?: React.ReactNode;
}

const TimelineFilters = ({ onFilterChange, onAddClick }: TimelineFiltersProps) => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event types from API
  const fetchEventTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/event-types');
      if (!response.ok) {
        throw new Error(`Failed to fetch event types: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEventTypes(data);
      
      // Initialize with no event types selected (show all by default)
      setSelectedTypeIds([]);
      onFilterChange([]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event types';
      logger.error('Failed to fetch event types', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleTypeToggle = (typeId: string) => {
    // If this type is already selected, deselect it (show all)
    // If this type is not selected, select only this type (show only this type)
    const newSelectedTypeIds = selectedTypeIds.includes(typeId)
      ? [] // Deselect all (show all events)
      : [typeId]; // Select only this type (show only this type)
    
    setSelectedTypeIds(newSelectedTypeIds);
    onFilterChange(newSelectedTypeIds);
  };

  const handleRefresh = () => {
    fetchEventTypes();
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-semibold">Loading event types...</h2>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white text-xl font-semibold">Error loading event types</h2>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Separate default and custom event types
  const defaultEventTypes = eventTypes.filter(type => type.isDefault);
  const customEventTypes = eventTypes.filter(type => !type.isDefault);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 transition-all duration-300 ease-in-out"
         style={{ 
           height: isExpanded ? 'auto' : '4rem',
           overflow: 'hidden'
         }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-white text-xl font-semibold">Event Categories</h2>
            {selectedTypeIds.length > 0 && (
              <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                Showing only {eventTypes.find(t => t.id === selectedTypeIds[0])?.displayName}
              </span>
            )}
            {selectedTypeIds.length === 0 && (
              <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                Showing all events
              </span>
            )}
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
          {/* Default Event Types */}
          {defaultEventTypes.map(type => (
            <button
              key={type.id}
              onClick={() => type.name !== 'birth' && handleTypeToggle(type.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
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
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: type.color }}
              />
              <span>{type.displayName}</span>
              {type.name === 'birth' && (
                <span className="text-xs text-gray-400">(Required)</span>
              )}
              {selectedTypeIds.includes(type.id) && type.name !== 'birth' && (
                <span className="text-xs text-gray-300">(Only)</span>
              )}
            </button>
          ))}
          
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    selectedTypeIds.includes(type.id)
                      ? 'bg-primary text-white' // Selected - show only this type
                      : selectedTypeIds.length === 0
                        ? 'bg-gray-700 text-white' // No selection - show all (this type is visible)
                        : 'text-gray-400 hover:text-white hover:bg-gray-800' // Not selected - this type is hidden
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span>{type.displayName}</span>
                  <span className="text-xs text-gray-500">(Custom)</span>
                  {selectedTypeIds.includes(type.id) && (
                    <span className="text-xs text-gray-300">(Only)</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters; 
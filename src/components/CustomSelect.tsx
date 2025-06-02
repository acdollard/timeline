import React, { useState, useRef, useEffect } from 'react';
import type { EventType } from '../utils/pinColors';
import { getPinColor } from '../utils/pinColors';

interface CustomSelectProps {
  value: EventType;
  onChange: (value: EventType) => void;
  options: EventType[];
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatOption = (option: string) => {
    return option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getPinColor(value)}`} />
          <span>{formatOption(value)}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${getPinColor(option)}`} />
              <span>{formatOption(option)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect; 
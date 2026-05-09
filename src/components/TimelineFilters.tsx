import React, { useState, useEffect } from 'react';
import type { EventType } from '../types/eventTypes';

interface TimelineFiltersProps {
  eventTypes: EventType[];
  onFilterChange: (selectedTypes: string[]) => void;
  onAddClick: () => void;
  onAddEventTypeClick: () => void;
  onDeleteEventType: (id: string) => Promise<void>;
  deletingEventTypeId?: string | null;
  children?: React.ReactNode;
}

const TimelineFilters = ({
  eventTypes,
  onFilterChange,
  onAddClick,
  onAddEventTypeClick,
  onDeleteEventType,
  deletingEventTypeId,
}: TimelineFiltersProps) => {
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
        setMobileSheetOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (eventTypes.length > 0) {
      setSelectedTypeIds([]);
      onFilterChange([]);
    }
  }, [eventTypes]);

  const handleTypeToggle = (typeId: string) => {
    const newSelectedTypeIds = selectedTypeIds.includes(typeId)
      ? []
      : [typeId];
    setSelectedTypeIds(newSelectedTypeIds);
    onFilterChange(newSelectedTypeIds);
  };

  const handleDeleteCustomType = async (
    event: React.MouseEvent<HTMLButtonElement>,
    type: EventType
  ) => {
    event.stopPropagation();
    const confirmed = window.confirm(
      `Delete custom event type "${type.displayName}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await onDeleteEventType(type.id);
    } catch (err) {
      console.error('Failed to delete event type:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to delete event type';
      window.alert(message);
    }
  };

  const birthEvent = eventTypes.find((type: EventType) => type.name === 'birth');
  const otherDefaultEvents = eventTypes.filter(
    (type: EventType) => type.isDefault && type.name !== 'birth'
  );
  const customEventTypes = eventTypes.filter((type: EventType) => !type.isDefault);
  const defaultEventTypes = birthEvent
    ? [birthEvent, ...otherDefaultEvents]
    : otherDefaultEvents;

  const gridGap = isMobile ? 'gap-2' : 'gap-4';
  const gridPad = isMobile ? 'p-2' : 'p-4';

  const categoryGrid = (
    <div
      className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-4 ${gridGap} ${gridPad}`}
    >
      {otherDefaultEvents.map((type) => (
        <button
          key={type.id}
          onClick={() => type.name !== 'birth' && handleTypeToggle(type.id)}
          className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2'} ${isMobile ? 'px-3 py-2.5' : 'px-3 py-2'} rounded-lg transition-all duration-200 ${
            type.name === 'birth'
              ? 'cursor-not-allowed bg-gray-600 text-gray-300'
              : selectedTypeIds.includes(type.id)
                ? 'bg-primary text-white'
                : selectedTypeIds.length === 0
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          disabled={type.name === 'birth'}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-full`}
              style={{ backgroundColor: type.color }}
            />
            <span className={`${isMobile ? 'text-sm' : 'text-sm'}`}>
              {type.displayName}
            </span>
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
        className="flex items-center space-x-2 rounded-lg bg-gray-700 px-3 py-2 text-white transition-all duration-200 hover:bg-gray-800 hover:text-white"
      >
        <svg
          className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Create Custom Event</span>
      </button>

      {customEventTypes.length > 0 && (
        <>
          {customEventTypes.length > 0 && defaultEventTypes.length > 0 && (
            <div className="col-span-full my-2 border-t border-gray-700" />
          )}
          {customEventTypes.map((type) => {
            const isSelected = selectedTypeIds.includes(type.id);
            const isDeleting = deletingEventTypeId === type.id;
            const wrapperBaseClasses = `group flex items-center ${isMobile ? 'px-3 py-2.5' : 'px-3 py-2'} rounded-lg transition-all duration-200`;
            const wrapperStateClasses = isSelected
              ? 'bg-primary text-white'
              : selectedTypeIds.length === 0
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white';

            return (
              <div
                key={type.id}
                className={`${wrapperBaseClasses} ${wrapperStateClasses}`}
              >
                <button
                  type="button"
                  onClick={() => handleTypeToggle(type.id)}
                  className={`flex flex-1 items-center justify-between ${isMobile ? 'space-x-3' : 'space-x-2'}`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-full`}
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm">{type.displayName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 transition-colors group-hover:text-gray-300">
                      (Custom)
                    </span>
                    {isSelected && (
                      <span className="text-xs text-gray-300">(Only)</span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(ev) => handleDeleteCustomType(ev, type)}
                  disabled={isDeleting}
                  className={`ml-2 rounded-md p-2 transition-all duration-200 ${
                    isDeleting
                      ? 'cursor-wait opacity-60'
                      : 'text-gray-400 hover:bg-gray-900/50 hover:text-red-400'
                  }`}
                  aria-label={`Delete ${type.displayName} event type`}
                >
                  {isDeleting ? (
                    <svg
                      className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-6 3h8m-7 0v10m4-10v10"
                      />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  return (
    <>
      {isMobile && mobileSheetOpen && (
        <>
          <div
            className="fixed inset-x-0 bottom-14 top-0 bg-black/50"
            style={{ zIndex: 'var(--z-dock-backdrop)' }}
            onClick={() => setMobileSheetOpen(false)}
            aria-hidden
          />
          <div
            className="fixed inset-x-0 bottom-14 max-h-[45vh] overflow-y-auto rounded-t-xl border border-b-0 border-gray-700 bg-gray-900 shadow-xl"
            style={{ zIndex: 'var(--z-dock-sheet)' }}
            role="dialog"
            aria-labelledby="mobile-categories-title"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-800 bg-gray-900 px-3 py-2">
              <h2
                id="mobile-categories-title"
                className="text-sm font-semibold text-white"
              >
                Event categories
              </h2>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="Close categories"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {categoryGrid}
          </div>
        </>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900 transition-all duration-300 ease-in-out"
        style={{
          height: isMobile ? '3.5rem' : isExpanded ? 'auto' : '4rem',
          overflow: isMobile ? 'visible' : 'hidden',
          zIndex: 'var(--z-dock-bar)',
        }}
      >
        <div className="mx-auto flex h-full max-w-screen-xl flex-col">
          {isMobile ? (
            <div className="flex h-14 items-center gap-1.5 px-2">
              <span
                className={`max-w-[4.5rem] shrink-0 truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  selectedTypeIds.length > 0
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {selectedTypeIds.length > 0 ? 'One type' : 'All'}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {otherDefaultEvents.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => type.name !== 'birth' && handleTypeToggle(type.id)}
                    disabled={type.name === 'birth'}
                    title={type.displayName}
                    className={`h-9 w-9 shrink-0 rounded-full border-2 transition-transform active:scale-95 disabled:opacity-40 ${
                      selectedTypeIds.includes(type.id)
                        ? 'border-white ring-2 ring-primary'
                        : selectedTypeIds.length === 0
                          ? 'border-transparent'
                          : 'border-transparent opacity-40'
                    }`}
                    style={{ backgroundColor: type.color }}
                  />
                ))}
                {customEventTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeToggle(type.id)}
                    title={type.displayName}
                    className={`h-9 w-9 shrink-0 rounded-full border-2 transition-transform active:scale-95 ${
                      selectedTypeIds.includes(type.id)
                        ? 'border-white ring-2 ring-primary'
                        : selectedTypeIds.length === 0
                          ? 'border-dashed border-gray-500'
                          : 'border-transparent opacity-40'
                    }`}
                    style={{ backgroundColor: type.color }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onAddClick}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-primary to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-primary"
                aria-label="Add event"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMobileSheetOpen((o) => !o)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                aria-expanded={mobileSheetOpen}
                aria-label="Open category list"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${mobileSheetOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-shrink-0 items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-white">Event Categories</h2>
                    {selectedTypeIds.length > 0 && (
                      <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                        Showing only{' '}
                        {eventTypes.find((t) => t.id === selectedTypeIds[0])?.displayName}
                      </span>
                    )}
                    {selectedTypeIds.length === 0 && (
                      <span className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-400">
                        All events
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-expanded={isExpanded}
                  >
                    <svg
                      className={`h-6 w-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
                  className="flex items-center space-x-2 rounded-lg bg-gradient-to-b from-primary to-orange-600 px-4 py-2 text-white transition-colors hover:from-orange-600 hover:to-primary"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Event</span>
                </button>
              </div>

              <div className={`${isExpanded ? 'max-h-[70vh] flex-1 overflow-y-auto' : ''}`}>
                <div
                  className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
                >
                  {categoryGrid}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TimelineFilters;

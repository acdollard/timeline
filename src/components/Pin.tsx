import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { getPinColor } from '../utils/pinColors';
import type { TimelineEvent } from '../types/events';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export type MobilePinLane = 'left' | 'right' | 'center';

interface PinProps {
  event: TimelineEvent;
  isBirth?: boolean;
  handleClick: (event: TimelineEvent) => void;
  isMobile?: boolean;
  index: number | 0;
  height: number;
  mobileLane?: MobilePinLane;
}

const Pin: React.FC<PinProps> = ({
  event,
  isBirth = false,
  handleClick,
  isMobile,
  index,
  height,
  mobileLane = 'right',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRect, setTooltipRect] = useState<{
    top: number;
    left: number;
    placement: 'above' | 'beside';
  } | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const formattedDate = useMemo(() => {
    return new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [event.date]);

  const updateTooltipPosition = () => {
    const el = dotRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (isMobile) {
      const placement = mobileLane === 'center' ? 'above' : 'beside';
      if (placement === 'above') {
        setTooltipRect({
          top: r.top - 8,
          left: r.left + r.width / 2,
          placement: 'above',
        });
      } else {
        const left = mobileLane === 'left' ? r.left - 8 : r.right + 8;
        setTooltipRect({
          top: r.top + r.height / 2,
          left,
          placement: 'beside',
        });
      }
    } else {
      setTooltipRect({
        top: r.top - 8,
        left: r.left + r.width / 2,
        placement: 'above',
      });
    }
  };

  useLayoutEffect(() => {
    if (!showTooltip) return;
    updateTooltipPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads layout from DOM refs
  }, [showTooltip, isMobile, mobileLane]);

  useEffect(() => {
    if (!showTooltip || !isMobile) return;
    const close = () => setShowTooltip(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [showTooltip, isMobile]);

  useGSAP(() => {
    if (!isMobile) {
      gsap.to(`.shaft-${event.id}`, {
        height: height,
        width: 0.5,
        duration: 0.2,
        ease: 'power2.inOut',
      });
    } else if (!isBirth) {
      gsap.to(`.shaft-${event.id}`, {
        width: height,
        duration: 0.2,
        ease: 'power2.inOut',
        transformOrigin: mobileLane === 'left' ? 'right center' : 'left center',
      });
    }
  }, [isMobile, event.id, height, isBirth, mobileLane]);

  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    return getPinColor(event.type || 'birth');
  };

  const tooltipPortal =
    showTooltip &&
    typeof document !== 'undefined' &&
    tooltipRect &&
    createPortal(
      <div
        className="fixed max-w-[min(90vw,320px)] rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white shadow-lg whitespace-normal pointer-events-none"
        style={{
          zIndex: 'var(--z-tooltip)',
          ...(tooltipRect.placement === 'above'
            ? {
                top: tooltipRect.top,
                left: tooltipRect.left,
                transform: 'translate(-50%, -100%)',
              }
            : {
                top: tooltipRect.top,
                left: tooltipRect.left,
                transform:
                  mobileLane === 'left'
                    ? 'translate(-100%, -50%)'
                    : 'translate(0, -50%)',
              }),
        }}
      >
        <p className="font-semibold">{event.name}</p>
        <div className="text-gray-300">{formattedDate}</div>
      </div>,
      document.body
    );

  if (isMobile) {
    const dot = (
      <div
        ref={dotRef}
        className="event h-8 w-8 shrink-0 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: getEventColor() }}
        onClick={() => handleClick(event)}
      />
    );

    if (isBirth || mobileLane === 'center') {
      return (
        <>
          <div
            className="pin flex min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)] items-center justify-center"
            onPointerEnter={() => setShowTooltip(true)}
            onPointerLeave={() => {
              setShowTooltip(false);
              setTooltipRect(null);
            }}
          >
            {dot}
            {tooltipPortal}
          </div>
        </>
      );
    }

    if (mobileLane === 'left') {
      return (
        <>
          <div
            className="pin flex min-h-[var(--touch-target-min)] flex-row items-center justify-end"
            onPointerEnter={() => setShowTooltip(true)}
            onPointerLeave={() => {
              setShowTooltip(false);
              setTooltipRect(null);
            }}
          >
            {dot}
            <div
              className={`shaft shaft-${event.id} h-0.5 shrink-0 bg-white`}
              style={{ width: 0, minWidth: 0 }}
            />
          </div>
          {tooltipPortal}
        </>
      );
    }

    return (
      <>
        <div
          className="pin flex min-h-[var(--touch-target-min)] flex-row items-center justify-start"
          onPointerEnter={() => setShowTooltip(true)}
          onPointerLeave={() => {
            setShowTooltip(false);
            setTooltipRect(null);
          }}
        >
          <div
            className={`shaft shaft-${event.id} h-0.5 shrink-0 bg-white`}
            style={{ width: 0, minWidth: 0 }}
          />
          {dot}
        </div>
        {tooltipPortal}
      </>
    );
  }

  return (
    <>
      <div
        className="pin relative"
        onPointerEnter={() => setShowTooltip(true)}
        onPointerLeave={() => {
          setShowTooltip(false);
          setTooltipRect(null);
        }}
      >
        <div
          ref={dotRef}
          className="event absolute h-4 w-4 cursor-pointer rounded-full transition-all duration-200"
          style={{
            backgroundColor: getEventColor(),
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%) scale(1)',
            transformOrigin: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              'translateX(-50%) translateY(-50%) scale(1.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              'translateX(-50%) translateY(-50%) scale(1)';
          }}
          onClick={() => handleClick(event)}
        />
        {showTooltip && (
          <div
            className={`absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              index !== 0 && index % 2 === 0
                ? 'rotate-180 origin-bottom -translate-y-full'
                : 'overflow-contain'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            <p className="font-semibold">{event.name}</p>
            <div className="text-gray-300">{formattedDate}</div>
          </div>
        )}
        {!isBirth && (
          <div className={`shaft shaft-${event.id} mx-auto h-0 w-0.5 bg-white`} />
        )}
      </div>
    </>
  );
};

export default Pin;

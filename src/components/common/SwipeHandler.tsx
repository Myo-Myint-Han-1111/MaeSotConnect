"use client";

import React, { useRef, TouchEvent } from "react";

interface SwipeHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance for a swipe to be registered
  allowedInElements?: string[]; // Element selectors where swipes are allowed
}

export const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  allowedInElements = ["body", ".page-content", ".content"],
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    // Check if the touch was in an allowed element
    const target = e.target as HTMLElement;
    const isAllowed = allowedInElements.some(
      (selector) => target.matches(selector) || target.closest(selector)
    );

    if (!isAllowed || !touchStartX.current || !touchEndX.current) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > threshold;
    const isSwipeRight = distance < -threshold;

    if (isSwipeLeft && onSwipeLeft) {
      onSwipeLeft();
    }

    if (isSwipeRight && onSwipeRight) {
      onSwipeRight();
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ height: "100%" }}
    >
      {children}
    </div>
  );
};

export default SwipeHandler;

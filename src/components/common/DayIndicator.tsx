"use client";

import React from "react";

interface DayIndicatorProps {
  days: string[]; // Array of day names (Sun, Mon, etc.)
  availableDays: boolean[]; // Array of boolean values indicating availability
  size?: "small" | "medium" | "large";
  interactive?: boolean; // Whether days can be clicked (for admin forms)
  onDayToggle?: (index: number) => void; // Callback for day selection
}

const DayIndicator: React.FC<DayIndicatorProps> = ({
  days,
  availableDays,
  size = "medium",
  interactive = false,
  onDayToggle,
}) => {
  // Calendar block sizing with minimal aesthetic
  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return {
          container: "gap-1",
          calendarBlock: "w-8 h-6", // 28x36px
          headerHeight: "h-2.5", // 1/3 of total height (12px of 36px)
          dayText: "text-xs font-semibold",
          borderRadius: "rounded",
        };
      case "large":
        return {
          container: "gap-2",
          calendarBlock: "w-16 h-16", // 48x64px
          headerHeight: "h-5", // 1/3 of total height (20px of 64px)
          dayText: "text-base font-bold",
          borderRadius: "rounded",
        };
      case "medium":
      default:
        return {
          container: "gap-1.5",
          calendarBlock: "w-9 h-9", // 36x48px
          headerHeight: "h-3", // 1/3 of total height (16px of 48px)
          dayText: "text-sm font-medium",
          borderRadius: "rounded",
        };
    }
  };

  const { container, calendarBlock, headerHeight, dayText, borderRadius } = getSizeConfig();

  const handleDayClick = (index: number) => {
    if (interactive && onDayToggle) {
      onDayToggle(index);
    }
  };

  return (
    <div className="mt-2">
      <div className={`flex ${container}`}>
        {days.map((day, index) => {
          const isAvailable = availableDays[index];
          
          const blockStyles = `
            ${calendarBlock}
            ${borderRadius}
            flex flex-col
            overflow-hidden
            ${isAvailable 
              ? "bg-gray-100" 
              : "bg-gray-100"
            }
          `;

          const headerStyles = `
            ${headerHeight}
            w-full
            ${isAvailable ? "bg-gray-700" : "bg-gray-300"}
          `;

          const contentStyles = `
            flex-1 
            flex items-center justify-center
            ${dayText}
            ${isAvailable ? "text-gray-800" : "text-gray-400"}
          `;

          const interactiveStyles = interactive
            ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all duration-150"
            : "";

          const CalendarDay = () => (
            <div className={`${blockStyles} ${interactiveStyles}`}>
              {/* Minimal top bar */}
              <div className={headerStyles} />
              {/* Day text */}
              <div className={contentStyles}>
                {day}
              </div>
            </div>
          );

          if (interactive) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDayClick(index)}
                className="focus:outline-none focus:ring-1 focus:ring-gray-400"
                aria-label={`${isAvailable ? 'Available' : 'Unavailable'} on ${day}`}
                aria-pressed={isAvailable}
              >
                <CalendarDay />
              </button>
            );
          }

          return (
            <div key={index}>
              <CalendarDay />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayIndicator;
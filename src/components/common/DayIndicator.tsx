"use client";

import React from "react";

interface DayIndicatorProps {
  days: string[]; // Array of day names (Sun, Mon, etc.)
  availableDays: boolean[]; // Array of boolean values indicating availability
  size?: "small" | "medium" | "large"; // Optional size prop for different contexts
}

const DayIndicator: React.FC<DayIndicatorProps> = ({
  days,
  availableDays,
  size = "medium",
}) => {
  // Size-based styling
  const getCalendarSize = () => {
    switch (size) {
      case "small":
        return { width: "26px", height: "36px", fontSize: "9px" };
      case "large":
        return { width: "38px", height: "52px", fontSize: "12px" };
      case "medium":
      default:
        return { width: "32px", height: "45px", fontSize: "11px" };
    }
  };

  const { width, height, fontSize } = getCalendarSize();

  return (
    <div className="flex justify-between gap-1 py-1 mt-auto sm:gap-2">
      {days.map((day, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`rounded-sm overflow-hidden ${
              availableDays[index]
                ? "border-2 border-gray-800"
                : "border border-gray-300 opacity-60"
            }`}
            style={{
              width,
              height,
              background: "linear-gradient(145deg, #e6e6e6, #ffffff)",
            }}
          >
            <div className="flex flex-col h-full">
              <div
                className={`${
                  availableDays[index] ? "bg-gray-800" : "bg-gray-400"
                }`}
                style={{ height: "8px" }}
              ></div>
              <div
                className={`flex-1 flex items-center justify-center font-bold ${
                  availableDays[index]
                    ? "text-black bg-white"
                    : "text-gray-700 bg-gray-100"
                }`}
                style={{ fontSize }}
              >
                {day}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DayIndicator;

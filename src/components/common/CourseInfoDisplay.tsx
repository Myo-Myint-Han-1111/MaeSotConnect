"use client";

import React from "react";
import { MapPin, Calendar, Clock, BookOpen } from "lucide-react";

interface CourseInfoDisplayProps {
  location: string;
  startDate: string;
  duration: string;
  schedule: string;
  compact?: boolean; // For compact view in card vs detailed view
}

const CourseInfoDisplay: React.FC<CourseInfoDisplayProps> = ({
  location,
  startDate,
  duration,
  schedule,
  compact = false,
}) => {
  // Choose styles based on compact mode
  const containerClass = compact ? "flex flex-col gap-2" : "space-y-4";
  const itemClass = compact
    ? "flex items-center gap-2 text-sm text-muted-foreground"
    : "flex items-start";
  const iconClass = compact
    ? "w-4 h-4 text-primary"
    : "h-5 w-5 mr-2 mt-0.5 text-muted-foreground";

  return (
    <div className={containerClass}>
      <div className={itemClass}>
        <MapPin className={iconClass} />
        <div>
          {!compact && (
            <p className="text-sm font-medium text-foreground">Location</p>
          )}
          <p className={compact ? "" : "text-sm text-muted-foreground"}>
            {location}
          </p>
        </div>
      </div>

      <div className={itemClass}>
        <Calendar className={iconClass} />
        <div>
          {!compact && (
            <p className="text-sm font-medium text-foreground">Start Date</p>
          )}
          <p className={compact ? "" : "text-sm text-muted-foreground"}>
            {startDate}
          </p>
        </div>
      </div>

      <div className={itemClass}>
        <Clock className={iconClass} />
        <div>
          {!compact && (
            <p className="text-sm font-medium text-foreground">Duration</p>
          )}
          <p className={compact ? "" : "text-sm text-muted-foreground"}>
            {duration}
          </p>
        </div>
      </div>

      <div className={itemClass}>
        <BookOpen className={iconClass} />
        <div>
          {!compact && (
            <p className="text-sm font-medium text-foreground">Schedule</p>
          )}
          <p className={compact ? "" : "text-sm text-muted-foreground"}>
            {schedule}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoDisplay;

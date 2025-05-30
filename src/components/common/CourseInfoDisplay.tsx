"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  HandCoins,
  CalendarCheck,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface CourseInfoDisplayProps {
  location: string;
  startDate: string;
  duration: string;
  schedule: string;
  applyByDate?: string;
  courseAddress?: string;
  fee?: string;
  compact?: boolean; // For compact view in card vs detailed view
  showDescriptions?: boolean; // New prop to control descriptions
  // TODO: Ko Myo - Add applyByDate field to database and props
  // applyByDate?: string;
}

const CourseInfoDisplay: React.FC<CourseInfoDisplayProps> = ({
  location,
  startDate,
  duration,
  schedule,
  fee,
  compact = false,
  showDescriptions = true, // Default to true for better UX
  applyByDate,
  courseAddress,
}) => {
  const { t } = useLanguage();

  // Direct color override (keeping your existing styling)
  const grayColor = "hsl(215.4, 16.3%, 46.9%)";

  // Choose styles based on compact mode
  const containerClass = compact ? "flex flex-col gap-2" : "space-y-4";
  const itemClass = compact
    ? "flex items-center gap-2 text-sm"
    : "flex items-start";
  const iconClass = compact ? "w-4 h-4 flex-shrink-0" : "h-5 w-5 mr-2 mt-0.5";

  return (
    <div className={containerClass}>
      {/* Location */}
      <div className={itemClass} style={{ color: grayColor }}>
        <MapPin className={iconClass} style={{ color: grayColor }} />
        <div className="flex-1 min-w-0">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Location</p>
          )}
          <p
            className={compact ? "truncate" : "text-sm"}
            style={{ color: grayColor }}
          >
            {location}
          </p>
        </div>
      </div>

      {/* Start Date - With "Starts" description */}
      <div className={itemClass} style={{ color: grayColor }}>
        <Calendar className={iconClass} style={{ color: grayColor }} />
        <div className="flex-1 min-w-0">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Start Date</p>
          )}
          {compact && showDescriptions && (
            <span
              className="text-xs mr-2 flex-shrink-0"
              style={{ color: grayColor }}
            >
              {t("course.info.starts")}:
            </span>
          )}
          <p
            className={compact ? "truncate" : "text-sm"}
            style={{ color: grayColor }}
          >
            {startDate}
          </p>
        </div>
      </div>

      {/* Course Address (if different from organization) */}
      {courseAddress && (
        <div className={itemClass} style={{ color: grayColor }}>
          <MapPin className={iconClass} style={{ color: grayColor }} />
          <div className="flex-1 min-w-0">
            {!compact && (
              <p className="text-sm font-medium text-foreground">
                Course Address
              </p>
            )}
            <p
              className={compact ? "truncate" : "text-sm"}
              style={{ color: grayColor }}
            >
              {courseAddress}
            </p>
          </div>
        </div>
      )}

      {/* Apply By Date */}
      {applyByDate && (
        <div className={itemClass} style={{ color: grayColor }}>
          <CalendarCheck className={iconClass} style={{ color: grayColor }} />
          <div className="flex-1 min-w-0">
            {!compact && (
              <p className="text-sm font-medium text-foreground">Apply By</p>
            )}
            {compact && showDescriptions && (
              <span
                className="text-xs mr-2 flex-shrink-0"
                style={{ color: grayColor }}
              >
                {t("course.info.applyBy")}:
              </span>
            )}
            <p
              className={compact ? "truncate" : "text-sm"}
              style={{ color: grayColor }}
            >
              {applyByDate}
            </p>
          </div>
        </div>
      )}

      {/* TODO: Ko Myo - Add Apply By Date field to database and uncomment below */}
      {/* Apply By Date - When implemented */}
      {/* {applyByDate && (
        <div className={itemClass} style={{ color: grayColor }}>
          <CalendarCheck className={iconClass} style={{ color: grayColor }} />
          <div className="flex-1 min-w-0">
            {!compact && (
              <p className="text-sm font-medium text-foreground">Apply By</p>
            )}
            {compact && showDescriptions && (
              <span className="text-xs mr-2 flex-shrink-0" style={{ color: grayColor }}>
                {t("course.info.applyBy")}:
              </span>
            )}
            <p className={compact ? "truncate" : "text-sm"} style={{ color: grayColor }}>
              {applyByDate}
            </p>
          </div>
        </div>
      )} */}

      {/* Duration - With description */}
      <div className={itemClass} style={{ color: grayColor }}>
        <Clock className={iconClass} style={{ color: grayColor }} />
        <div className="flex-1 min-w-0">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Duration</p>
          )}
          {compact && showDescriptions && (
            <span
              className="text-xs mr-2 flex-shrink-0"
              style={{ color: grayColor }}
            >
              {t("course.info.duration")}:
            </span>
          )}
          <p
            className={compact ? "truncate" : "text-sm"}
            style={{ color: grayColor }}
          >
            {duration}
          </p>
        </div>
      </div>

      {/* Fee - With description if provided */}
      {fee && (
        <div className={itemClass} style={{ color: grayColor }}>
          <HandCoins className={iconClass} style={{ color: grayColor }} />
          <div className="flex-1 min-w-0">
            {!compact && (
              <p className="text-sm font-medium text-foreground">Fee</p>
            )}
            {compact && showDescriptions && (
              <span
                className="text-xs mr-2 flex-shrink-0"
                style={{ color: grayColor }}
              >
                {t("course.info.fee")}:
              </span>
            )}
            <p
              className={compact ? "truncate" : "text-sm"}
              style={{ color: grayColor }}
            >
              {fee}
            </p>
          </div>
        </div>
      )}

      {/* Schedule - With description */}
      <div className={itemClass} style={{ color: grayColor }}>
        <BookOpen className={iconClass} style={{ color: grayColor }} />
        <div className="flex-1 min-w-0">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Schedule</p>
          )}
          {compact && showDescriptions && (
            <span
              className="text-xs mr-2 flex-shrink-0"
              style={{ color: grayColor }}
            >
              {t("course.info.schedule")}:
            </span>
          )}
          <p
            className={compact ? "truncate" : "text-sm"}
            style={{ color: grayColor }}
          >
            {schedule}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoDisplay;

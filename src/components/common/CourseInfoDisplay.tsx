"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  HandCoins,
  CalendarCheck,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface CourseInfoDisplayProps {
  location: string;
  startDate: string;
  duration: string;

  applyByDate?: string;
  courseAddress?: string;
  fee?: string;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  compact?: boolean;
  showDescriptions?: boolean;
}

// Helper function to decode estimated date preferences from the stored string
const parseEstimatedDatePreferences = (estimatedDateString: string | null) => {
  if (!estimatedDateString) {
    return {
      displayText: null,
      showForStartDate: false,
      showForApplyByDate: false,
    };
  }

  // Check if the string contains our encoding (text|startFlag|applyFlag)
  const parts = estimatedDateString.split("|");
  if (parts.length === 3) {
    return {
      displayText: parts[0],
      showForStartDate: parts[1] === "1",
      showForApplyByDate: parts[2] === "1",
    };
  }

  // If no encoding found, fall back to old behavior (show for both)
  return {
    displayText: estimatedDateString,
    showForStartDate: true,
    showForApplyByDate: true,
  };
};

const CourseInfoDisplay: React.FC<CourseInfoDisplayProps> = ({
  location,
  startDate,
  duration,

  fee,
  compact = false,
  showDescriptions = true,
  applyByDate,
  courseAddress,
  estimatedDate,
  estimatedDateMm,
}) => {
  const { t, language } = useLanguage();

  // Parse estimated date preferences
  const estimatedPrefs = parseEstimatedDatePreferences(
    language === "mm" && estimatedDateMm
      ? estimatedDateMm
      : estimatedDate ?? null
  );

  // Direct color override (keeping your existing styling)
  const grayColor = "hsl(var(--muted-foreground))";

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

      {/* Start Date - Show estimated date badge based on preferences */}
      <div className={itemClass} style={{ color: grayColor }}>
        <Calendar className={iconClass} style={{ color: grayColor }} />
        <div className="flex-1 min-w-0">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Start Date</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {compact && showDescriptions && (
              <span
                className="text-xs w-20 flex-shrink-0"
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
            {/* Show estimated date badge only if preferences allow it for start date */}
            {estimatedPrefs.showForStartDate && estimatedPrefs.displayText && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs whitespace-nowrap">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{estimatedPrefs.displayText}</span>
              </span>
            )}
          </div>
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

      {/* Apply By Date - Show estimated date badge based on preferences */}
      {applyByDate && (
        <div className={itemClass} style={{ color: grayColor }}>
          <CalendarCheck className={iconClass} style={{ color: grayColor }} />
          <div className="flex-1 min-w-0">
            {!compact && (
              <p className="text-sm font-medium text-foreground">Apply By</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {compact && showDescriptions && (
                <span
                  className="text-xs w-20 flex-shrink-0"
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
              {/* Show estimated date badge only if preferences allow it for apply by date */}
              {estimatedPrefs.showForApplyByDate &&
                estimatedPrefs.displayText && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {estimatedPrefs.displayText}
                    </span>
                  </span>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Duration - With description */}
      <div className={itemClass} style={{ color: grayColor }}>
        <Clock className={iconClass} style={{ color: grayColor }} />
        <div className="flex items-center gap-2 flex-wrap">
          {!compact && (
            <p className="text-sm font-medium text-foreground">Duration</p>
          )}
          {compact && showDescriptions && (
            <span
              className="text-xs w-20 flex-shrink-0"
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
          <div className="flex items-center gap-2 flex-wrap">
            {!compact && (
              <p className="text-sm font-medium text-foreground">Fee</p>
            )}
            {compact && showDescriptions && (
              <span
                className="text-xs w-20 flex-shrink-0"
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
    </div>
  );
};

export default CourseInfoDisplay;

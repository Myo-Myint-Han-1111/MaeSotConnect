"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../context/LanguageContext";

// Badge style interface
export interface BadgeStyle {
  text: string;
  color: string;
  backgroundColor: string;
}

// Centralized badge styles
export const BADGE_STYLES: Record<string, BadgeStyle> = {
  "In-person": {
    text: "In-person",
    color: "#fff",
    backgroundColor: "#28a745", // Green
  },
  Online: {
    text: "Online",
    color: "#fff",
    backgroundColor: "#007bff", // Blue
  },
  Free: {
    text: "Free",
    color: "#fff",
    backgroundColor: "#dc3545", // Red
  },
  Internship: {
    text: "Internship",
    color: "#fff",
    backgroundColor: "#fd7e14", // Orange
  },
  Certificate: {
    text: "Certificate",
    color: "#fff",
    backgroundColor: "#17a2b8", // Cyan
  },
  Vocational: {
    text: "Vocational",
    color: "#fff",
    backgroundColor: "#6610f2", // Purple
  },
  Cooking: {
    text: "Cooking",
    color: "#fff",
    backgroundColor: "#e83e8c", // Pink
  },
  "Barista Training": {
    text: "Barista Training",
    color: "#fff",
    backgroundColor: "#6f4e37", // Brown
  },
  Hospitality: {
    text: "Hospitality",
    color: "#fff",
    backgroundColor: "#20c997", // Teal
  },
  "Hair Dressing": {
    text: "Hair Dressing",
    color: "#fff",
    backgroundColor: "#f8c2d4", // Light Pink
  },
  Fashion: {
    text: "Fashion",
    color: "#fff",
    backgroundColor: "#e91e63", // Deep Pink
  },
  Technology: {
    text: "Technology",
    color: "#fff",
    backgroundColor: "#6c757d", // Gray (CHANGED from #007bff)
  },
  "Computer Skills": {
    text: "Computer Skills",
    color: "#fff",
    backgroundColor: "#343a40", // Dark Gray
  },
  Media: {
    text: "Media",
    color: "#fff",
    backgroundColor: "#9c27b0", // Deep Purple
  },
  "Mental Health": {
    text: "Mental Health",
    color: "#fff",
    backgroundColor: "#4caf50", // Light Green
  },
  Sports: {
    text: "Sports",
    color: "#fff",
    backgroundColor: "#ff5722", // Deep Orange
  },
  Art: {
    text: "Art",
    color: "#fff",
    backgroundColor: "#3f51b5", // Indigo
  },
  Music: {
    text: "Music",
    color: "#fff",
    backgroundColor: "#795548", // Brown Gray
  },
  "Martial Art": {
    text: "Martial Art",
    color: "#fff",
    backgroundColor: "#607d8b", // Blue Gray
  },
  GED: {
    text: "GED",
    color: "#fff",
    backgroundColor: "#ff9800", // Amber
  },
  IELTS: {
    text: "IELTS",
    color: "#fff",
    backgroundColor: "#2196f3", // Light Blue
  },
  Thailand: {
    text: "Thailand",
    color: "#fff",
    backgroundColor: "#ff6b35", // Coral
  },
  Korea: {
    text: "Korea",
    color: "#fff",
    backgroundColor: "#4ecdc4", // Turquoise
  },
  Japan: {
    text: "Japan",
    color: "#fff",
    backgroundColor: "#e74c3c", // Crimson
  },
  English: {
    text: "English",
    color: "#fff",
    backgroundColor: "#2c3e50", // Dark Blue
  },
};

// Helper function to create badges
export const createBadge = (badgeText: string): BadgeStyle => {
  return (
    BADGE_STYLES[badgeText] || {
      text: badgeText,
      color: "#333",
      backgroundColor: "#e5e5e5",
    }
  );
};

// Badge display component props
interface BadgeDisplayProps {
  badges: BadgeStyle[];
  size?: "small" | "medium" | "large";
}

// Main BadgeDisplay component
export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  size = "medium",
}) => {
  const { t } = useLanguage();

  // Updated translate badge text function - HANDLES LEGACY BADGES
  const translateBadge = (badgeText: string) => {
    // Handle legacy badge mapping
    let normalizedBadgeText = badgeText;

    // Map legacy badges to new format
    if (badgeText === "In-Person") {
      normalizedBadgeText = "In-person";
    }

    const translationKey = `badge.${normalizedBadgeText.toLowerCase()}`;
    const translation = t(translationKey);

    return translationKey !== translation ? translation : normalizedBadgeText;
  };

  // Size-based styling
  const getBadgeClass = () => {
    switch (size) {
      case "small":
        return "pt-1 pb-1.5 px-2 text-xs";
      case "large":
        return "pt-1 pb-1.5 px-4 text-sm";
      case "medium":
      default:
        return "py-1 px-3 text-sm";
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {badges.map((badge, index) => (
        <Badge
          key={index}
          style={{
            backgroundColor: badge.backgroundColor,
            color: badge.color,
          }}
          className={getBadgeClass()}
        >
          {translateBadge(badge.text)}
        </Badge>
      ))}
    </div>
  );
};

export default BadgeDisplay;

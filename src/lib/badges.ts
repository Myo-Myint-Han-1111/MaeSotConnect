import { useLanguage } from "../context/LanguageContext";

export interface BadgeStyle {
  text: string;
  color: string;
  backgroundColor: string;
}

export const BADGE_STYLES: Record<string, BadgeStyle> = {
  "In-person": {
    text: "In-person",
    color: "#fff",
    backgroundColor: "#28a745",
  },
  Online: {
    text: "Online",
    color: "#fff",
    backgroundColor: "#007bff",
  },
  Free: {
    text: "Free",
    color: "#fff",
    backgroundColor: "#dc3545",
  },
  Internship: {
    text: "Internship",
    color: "#fff",
    backgroundColor: "#fd7e14",
  },
  Certificate: {
    text: "Certificate",
    color: "#fff",
    backgroundColor: "#17a2b8",
  },
  Vocational: {
    text: "Vocational",
    color: "#fff",
    backgroundColor: "#6610f2",
  },
  "Pre-university": {
    text: "Pre-university",
    color: "#fff",
    backgroundColor: "#1976d2",
  },
  "Pre-career": {
    text: "Pre-career",
    color: "#fff",
    backgroundColor: "#388e3c",
  },
  Cooking: {
    text: "Cooking",
    color: "#fff",
    backgroundColor: "#e83e8c",
  },
  "Barista Training": {
    text: "Barista Training",
    color: "#fff",
    backgroundColor: "#6f4e37",
  },
  Hospitality: {
    text: "Hospitality",
    color: "#fff",
    backgroundColor: "#20c997",
  },
  "Hair Dressing": {
    text: "Hair Dressing",
    color: "#fff",
    backgroundColor: "#f8c2d4",
  },
  Fashion: {
    text: "Fashion",
    color: "#fff",
    backgroundColor: "#e91e63",
  },
  Technology: {
    text: "Technology",
    color: "#fff",
    backgroundColor: "#6c757d",
  },
  "Computer Skills": {
    text: "Computer Skills",
    color: "#fff",
    backgroundColor: "#343a40",
  },
  Media: {
    text: "Media",
    color: "#fff",
    backgroundColor: "#9c27b0",
  },
  "Mental Health": {
    text: "Mental Health",
    color: "#fff",
    backgroundColor: "#4caf50",
  },
  Sports: {
    text: "Sports",
    color: "#fff",
    backgroundColor: "#ff5722",
  },
  Art: {
    text: "Art",
    color: "#fff",
    backgroundColor: "#3f51b5",
  },
  Music: {
    text: "Music",
    color: "#fff",
    backgroundColor: "#795548",
  },
  "Martial Art": {
    text: "Martial Art",
    color: "#fff",
    backgroundColor: "#607d8b",
  },
  GED: {
    text: "GED",
    color: "#fff",
    backgroundColor: "#ff9800",
  },
  IELTS: {
    text: "IELTS",
    color: "#fff",
    backgroundColor: "#2196f3",
  },
  Thai: {
    text: "Thai",
    color: "#fff",
    backgroundColor: "#ff6b35",
  },
  Korea: {
    text: "Korea",
    color: "#fff",
    backgroundColor: "#4ecdc4",
  },
  Japan: {
    text: "Japan",
    color: "#fff",
    backgroundColor: "#e74c3c",
  },
  English: {
    text: "English",
    color: "#fff",
    backgroundColor: "#2c3e50",
  },
  Chess: {
    text: "Chess",
    color: "#fff",
    backgroundColor: "#8b4513",
  },
  Agriculture: {
    text: "Agriculture",
    color: "#fff",
    backgroundColor: "#8bc34a",
  },
  Sewing: {
    text: "Sewing",
    color: "#fff",
    backgroundColor: "#9b59b6",
  },
};

const DEFAULT_BADGE_STYLE: BadgeStyle = {
  text: "",
  color: "#333",
  backgroundColor: "#e5e5e5",
};

/**
 * Optimized badge style resolution with direct lookup
 */
export const getBadgeStyle = (badgeText: string): BadgeStyle => {
  return (
    BADGE_STYLES[badgeText] || {
      ...DEFAULT_BADGE_STYLE,
      text: badgeText,
    }
  );
};

/**
 * Custom hook for badge translation and styling
 */
export const useBadgeTranslation = () => {
  const { t } = useLanguage();

  const translateBadge = (badgeText: string): string => {
    const translationKey = `badge.${badgeText.toLowerCase()}`;
    const translation = t(translationKey);

    return translationKey !== translation ? translation : badgeText;
  };

  return { translateBadge, getBadgeStyle };
};

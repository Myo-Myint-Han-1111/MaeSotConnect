"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { useBadgeTranslation, type BadgeStyle } from "../../lib/badges";

interface BadgeDisplayProps {
  badges: BadgeStyle[];
  size?: "small" | "medium" | "large";
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  size = "medium",
}) => {
  const { translateBadge } = useBadgeTranslation();

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

// import React from "react";
// import { Badge } from "../ui/badge";
// import { useLanguage } from "../../context/LanguageContext";

// // Badge style interface
// export interface BadgeStyle {
//   text: string;
//   color: string;
//   backgroundColor: string;
// }

// // Centralized badge styles
// export const BADGE_STYLES: Record<string, BadgeStyle> = {
//   Language: {
//     text: "Language",
//     color: "#fff",
//     backgroundColor: "#6e8efb",
//   },
//   "In-Person": {
//     text: "In-Person",
//     color: "#fff",
//     backgroundColor: "#28a745",
//   },
//   Free: {
//     text: "Free",
//     color: "#fff",
//     backgroundColor: "#dc3545",
//   },
//   Technology: {
//     text: "Technology",
//     color: "#fff",
//     backgroundColor: "#007bff",
//   },
//   Beginner: {
//     text: "Beginner",
//     color: "#000",
//     backgroundColor: "#ffc107",
//   },
//   Vocational: {
//     text: "Vocational",
//     color: "#fff",
//     backgroundColor: "#6610f2",
//   },
//   Internship: {
//     text: "Internship",
//     color: "#fff",
//     backgroundColor: "#fd7e14",
//   },
//   Certification: {
//     text: "Certification",
//     color: "#fff",
//     backgroundColor: "#17a2b8",
//   },
// };

// // Helper function to create badges
// export const createBadge = (badgeText: string): BadgeStyle => {
//   return (
//     BADGE_STYLES[badgeText] || {
//       text: badgeText,
//       color: "#333",
//       backgroundColor: "#e5e5e5",
//     }
//   );
// };

// // Badge display component props
// interface BadgeDisplayProps {
//   badges: BadgeStyle[];
//   size?: "small" | "medium" | "large";
// }

// // Main BadgeDisplay component
// export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
//   badges,
//   size = "medium",
// }) => {
//   const { t } = useLanguage();

//   // Translate badge text
//   const translateBadge = (badgeText: string) => {
//     if (badgeText === "In-Person") return t("badge.inperson");
//     if (badgeText === "Language") return t("badge.language");
//     if (badgeText === "Free") return t("badge.free");
//     if (badgeText === "Vocational") return t("badge.vocational");
//     if (badgeText === "Internship") return t("badge.internship");
//     if (badgeText === "Technology") return t("badge.technology");
//     if (badgeText === "Beginner") return t("badge.beginner");
//     return badgeText;
//   };

//   // Size-based styling
//   const getBadgeClass = () => {
//     switch (size) {
//       case "small":
//         return "pt-1 pb-1.5 px-2 text-xs";
//       case "large":
//         return "pt-1 pb-1.5 px-4 text-sm";
//       case "medium":
//       default:
//         return "py-1 px-3 text-sm";
//     }
//   };

//   return (
//     <div className="flex flex-wrap gap-2 mb-4">
//       {badges.map((badge, index) => (
//         <Badge
//           key={index}
//           style={{
//             backgroundColor: badge.backgroundColor,
//             color: badge.color,
//           }}
//           className={getBadgeClass()}
//         >
//           {translateBadge(badge.text)}
//         </Badge>
//       ))}
//     </div>
//   );
// };

// export default BadgeDisplay;

import { type Language } from "@/context/LanguageContext";

// Font Size Definitions
export interface FontSizeDefinition {
  fontSize: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontWeight?: number;
}

// Base Font Sizes for Different Text Types
export interface TextTypeFontSizes {
  heading1: FontSizeDefinition;
  heading2: FontSizeDefinition;
  heading3: FontSizeDefinition;
  bodyLarge: FontSizeDefinition;
  bodyRegular: FontSizeDefinition;
  bodySmall: FontSizeDefinition;
  caption: FontSizeDefinition;
}

// Language-Specific Font Size Configurations
export const fontSizes: Record<Language, TextTypeFontSizes> = {
  en: {
    heading1: {
      fontSize: "text-4xl", // 2.25rem / 36px
      fontWeight: 700,
      lineHeight: "leading-tight",
    },
    heading2: {
      fontSize: "text-3xl", // 1.875rem / 30px
      fontWeight: 600,
      lineHeight: "leading-tight",
    },
    heading3: {
      fontSize: "text-2xl", // 1.5rem / 24px
      fontWeight: 500,
      lineHeight: "leading-normal",
    },
    bodyLarge: {
      fontSize: "text-lg", // 1.125rem / 18px
      fontWeight: 400,
      lineHeight: "leading-relaxed",
    },
    bodyRegular: {
      fontSize: "text-base", // 1rem / 16px
      fontWeight: 400,
      lineHeight: "leading-relaxed",
    },
    bodySmall: {
      fontSize: "text-sm", // 0.875rem / 14px
      fontWeight: 400,
      lineHeight: "leading-normal",
    },
    caption: {
      fontSize: "text-xs", // 0.75rem / 12px
      fontWeight: 400,
      lineHeight: "leading-normal",
    },
  },
  mm: {
    heading1: {
      fontSize: "text-3xl", // Slightly smaller for Myanmar script
      fontWeight: 700,
      lineHeight: "leading-tight",
    },
    heading2: {
      fontSize: "text-2xl", // Adjusted for Myanmar script
      fontWeight: 600,
      lineHeight: "leading-tight",
    },
    heading3: {
      fontSize: "text-xl", // Adjusted for Myanmar script
      fontWeight: 500,
      lineHeight: "leading-normal",
    },
    bodyLarge: {
      fontSize: "text-sm", // Slightly smaller for Myanmar script
      fontWeight: 400,
      lineHeight: "leading-relaxed",
    },
    bodyRegular: {
      fontSize: "text-sm", // Adjusted for Myanmar script
      fontWeight: 400,
      lineHeight: "leading-relaxed",
    },
    bodySmall: {
      fontSize: "text-xs", // Smaller for Myanmar script
      fontWeight: 400,
      lineHeight: "leading-normal",
    },
    caption: {
      fontSize: "text-[0.625rem]", // Extra small
      fontWeight: 400,
      lineHeight: "leading-normal",
    },
  },
};

// Helper function to get font size classes
export function getFontSizeClasses(
  type: keyof TextTypeFontSizes,
  language: Language = "en"
): string {
  const sizeConfig = fontSizes[language][type];

  // Map numeric font weights to Tailwind classes
  const fontWeightMap: { [key: number]: string } = {
    100: "font-thin",
    200: "font-extralight",
    300: "font-light",
    400: "font-normal",
    500: "font-medium",
    600: "font-semibold",
    700: "font-bold",
    800: "font-extrabold",
    900: "font-black",
  };

  // Combine all defined classes
  return [
    sizeConfig.fontSize,
    sizeConfig.fontWeight ? fontWeightMap[sizeConfig.fontWeight] : "",
    sizeConfig.lineHeight || "",
  ]
    .filter(Boolean)
    .join(" ");
}
// Example usage in a component:
// const headingClasses = getFontSizeClasses('heading1', language);
// <h1 className={headingClasses}>Your Heading</h1>

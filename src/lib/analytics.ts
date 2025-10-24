// src/lib/analytics.ts

// Define types for events
export type EventName =
  | "course_view"
  | "course_search"
  | "apply_click"
  | "organization_view"
  | "sign_in"
  | "sign_out";

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Send custom events to Google Analytics
export const trackEvent = (eventName: EventName, params?: EventParams) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

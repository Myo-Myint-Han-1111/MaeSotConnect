// src/types.ts

export interface Image {
  id: string;
  url: string;
  courseId: string;
}

export interface Badge {
  id: string;
  text: string;
  color: string;
  backgroundColor: string;
  courseId: string;
}

export interface FAQ {
  id: string;
  question: string;
  questionMm?: string | null; // Added Myanmar version
  answer: string;
  answerMm?: string | null; // Added Myanmar version
  courseId: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  facebookPage?: string | null;
  latitude: number;
  longitude: number;
  district?: string | null; // Added new field
  province?: string | null; // Added new field
}

export interface Course {
  id: string;
  title: string;
  titleMm?: string | null;
  subtitle: string;
  subtitleMm?: string | null;
  // Removed location and locationMm as they don't exist in the new schema
  startDate: Date; // Changed type from string to Date
  startDateMm?: Date | null; // Changed type from string to Date
  endDate: Date; // Added new field
  endDateMm?: Date | null; // Added new field
  duration: number; // Changed type from string to number
  durationMm?: number | null; // Changed type from string to number
  schedule: string;
  scheduleMm?: string | null;
  feeAmount: number; // New field replacing fee/feeMm
  feeAmountMm?: number | null; // New field
  ageMin: number; // Added new field
  ageMinMm?: number | null; // Added new field
  ageMax: number; // Added new field
  ageMaxMm?: number | null; // Added new field
  document: string; // Added new field
  documentMm?: string | null; // Added new field
  availableDays: boolean[];
  description?: string | null;
  descriptionMm?: string | null;
  outcomes: string[];
  outcomesMm: string[]; // Now required (no ? operator)
  scheduleDetails?: string | null;
  scheduleDetailsMm?: string | null;
  selectionCriteria: string[];
  selectionCriteriaMm: string[]; // Now required (no ? operator)
  organizationId?: string | null;
  createdAt?: Date; // Added timestamp
  updatedAt?: Date; // Added timestamp
  images: {
    id: string;
    url: string;
  }[];
  badges: {
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  faq?: {
    // Added FAQ
    id: string;
    question: string;
    questionMm?: string | null;
    answer: string;
    answerMm?: string | null;
  }[];
  organizationInfo?: Organization | null; // Explicitly including related organization
}

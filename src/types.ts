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
  address?: string | null;
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
  startDate: Date;
  startDateMm?: Date | null;
  endDate: Date;
  endDateMm?: Date | null;
  duration: number;
  durationMm?: number | null;
  schedule: string;
  scheduleMm?: string | null;
  feeAmount: number;
  feeAmountMm?: number | null;
  ageMin: number;
  ageMinMm?: number | null;
  ageMax: number;
  ageMaxMm?: number | null;
  document: string;
  documentMm?: string | null;
  // NEW FIELDS ADDED
  province?: string | null;
  district?: string | null;
  address?: string | null;
  applyByDate?: string | null; // ISO string format
  applyByDateMm?: string | null;
  startByDate?: string | null; // ISO string format
  startByDateMm?: string | null;
  logoImage?: string | null;
  // HOW TO APPLY FIELDS - NEW
  howToApply?: string[] | null;
  howToApplyMm?: string[] | null;
  applyButtonText?: string | null;
  applyButtonTextMm?: string | null;
  applyLink?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  // END NEW FIELDS
  availableDays: boolean[];
  description?: string | null;
  descriptionMm?: string | null;
  outcomes: string[];
  outcomesMm: string[];
  scheduleDetails?: string | null;
  scheduleDetailsMm?: string | null;
  selectionCriteria: string[];
  selectionCriteriaMm: string[];
  organizationId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
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
    id: string;
    question: string;
    questionMm?: string | null;
    answer: string;
    answerMm?: string | null;
  }[];
  organizationInfo?: Organization | null;
}

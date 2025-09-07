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
  logoImage?: string | null; // Added logo field
  slug: string; // Added slug field
}

// ADD NEW ENUMS FOR ORGANIZATION ADMIN
export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ARCHIVED = "ARCHIVED",
}

export enum Role {
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  YOUTH_ADVOCATE = "YOUTH_ADVOCATE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum DraftStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DRAFT = "DRAFT",
}

export enum DraftType {
  COURSE = "COURSE",
  ORGANIZATION_UPDATE = "ORGANIZATION_UPDATE",
  ORGANIZATION = "ORGANIZATION",
}

export enum DurationUnit {
  DAYS = "DAYS",
  WEEKS = "WEEKS",
  MONTHS = "MONTHS",
  YEARS = "YEARS",
}

// ADD USER INTERFACE
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  organizationId?: string | null;
  status: UserStatus;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization | null;
}

// ADD CONTENT DRAFT INTERFACE
export interface ContentDraft {
  id: string;
  title: string;
  type: DraftType;
  content: Record<string, unknown>;
  status: DraftStatus;
  createdBy: string;
  organizationId?: string | null;
  originalCourseId?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  organization?: {
    name: string;
  } | null;
  author?: {
    name: string;
    email: string;
  };
}

export interface Course {
  id: string;
  title: string;
  titleMm?: string | null;
  subtitle: string;
  subtitleMm?: string | null;
  startDate: Date;
  endDate: Date;
  duration: number;
  durationUnit: DurationUnit;
  durationUnitMm?: DurationUnit | null;
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
  // LOCATION FIELDS
  province?: string | null;
  district?: string | null;
  address?: string | null;
  // DATE FIELDS
  applyByDate?: string | null; // ISO string format
  startByDate?: string | null; // ISO string format
  // APPLICATION FIELDS
  howToApply?: string[] | null;
  howToApplyMm?: string[] | null;
  applyButtonText?: string | null;
  applyButtonTextMm?: string | null;
  applyLink?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  // SYSTEM FIELDS
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
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  slug: string;

  // NEW ORGANIZATION ADMIN FIELDS
  status?: CourseStatus;
  lastModifiedBy?: string | null;
  publishedAt?: Date | null;

  // RELATIONS
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
  createdByUser?: User | null;
  lastModifiedByUser?: User | null;
}

// ADD SESSION USER INTERFACE FOR BETTER TYPE SAFETY
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  organizationId?: string | null;
  status?: UserStatus;
}

// ADD API RESPONSE INTERFACES
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ADD FORM DATA INTERFACES
export interface CourseFormData {
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  description?: string;
  descriptionMm?: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationUnit: DurationUnit;
  durationUnitMm?: DurationUnit;
  schedule: string;
  scheduleMm?: string;
  feeAmount: number;
  feeAmountMm?: number;
  province?: string;
  district?: string;
  address?: string;
  applyByDate?: string;
  ageMin?: number;
  ageMax?: number;
  ageMinMm?: number;
  ageMaxMm?: number;
  outcomes: string[];
  outcomesMm: string[];
  selectionCriteria: string[];
  selectionCriteriaMm: string[];
  howToApply: string[];
  howToApplyMm: string[];
  applyButtonText?: string;
  applyButtonTextMm?: string;
  applyLink?: string;
  faq: Array<{
    question: string;
    questionMm?: string;
    answer: string;
    answerMm?: string;
  }>;
}

export interface OrganizationFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address?: string;
  facebookPage?: string;
  latitude: number;
  longitude: number;
  district?: string;
  province?: string;
  logoImageUrl?: string;
}

export interface DurationDisplay {
  value: number;
  unit: DurationUnit;
  language?: "en" | "mm";
}

export interface DurationFormFields {
  duration: number;
  durationUnit: DurationUnit;
  durationUnitMm?: DurationUnit;
}

// Duration unit options for forms
export const DURATION_UNIT_OPTIONS = {
  en: [
    { value: "DAYS" as DurationUnit, label: "Days" },
    { value: "WEEKS" as DurationUnit, label: "Weeks" },
    { value: "MONTHS" as DurationUnit, label: "Months" },
    { value: "YEARS" as DurationUnit, label: "Years" },
  ],
  mm: [
    { value: "DAYS" as DurationUnit, label: "ရက်" },
    { value: "WEEKS" as DurationUnit, label: "ပတ်" },
    { value: "MONTHS" as DurationUnit, label: "လ" },
    { value: "YEARS" as DurationUnit, label: "နှစ်" },
  ],
} as const;

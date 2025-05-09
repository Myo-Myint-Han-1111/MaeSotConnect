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
  answer: string;
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
}

export interface Course {
  id: string;
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  location: string;
  locationMm?: string;
  startDate: string;
  startDateMm?: string;
  duration: string;
  durationMm?: string;
  schedule: string;
  scheduleMm?: string;
  fee?: string;
  feeMm?: string;
  availableDays: boolean[];
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
}

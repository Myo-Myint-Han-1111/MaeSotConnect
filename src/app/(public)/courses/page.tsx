"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { useBadgeTranslation } from "../../../lib/badges";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import {
  ChevronLeft,
  MapPin,
  Clock,
  Calendar,
  BookOpen,
  Target,
  HelpCircle,
  Info,
  CalendarDays,
  CheckSquare,
  PhoneCall,
  Mail,
  Facebook,
  FileText,
  User,
} from "lucide-react";

// Import the enhanced ImageCarousel component
import ImageCarousel from "../../../components/common/ImageCarousel";
import DayIndicator from "../../../components/common/DayIndicator";

// CSS from CourseDetail.css
const courseDetailStyles = `
.course-detail-page {
  padding-top: 70px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.course-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.course-detail-header {
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #6e8efb;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.back-button:hover {
  color: #4b6ce0;
}

.course-detail-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.course-detail-header .subtitle {
  font-size: 1.2rem;
  color: #6b7280;
}

/* Image carousel styling similar to CourseCard */
.course-image-gallery {
  position: relative;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 400px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}




.course-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Combined info section */
.combined-info-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.course-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.info-item h3 {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.info-item p {
  color: #1f2937;
  font-size: 1rem;
}

.available-days-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.available-days-container h3 {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
}

.days-grid {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f9fafb;
  width: 60px;
  flex-shrink: 0;
}

.day-item.available {
  background: #f0f9ff;
}

.day-name {
  font-weight: 500;
  color: #4b5563;
}

.availability-indicator {
  color: #6e8efb;
  font-size: 1rem;
}

.day-item.unavailable .availability-indicator {
  color: #d1d5db;
}






.digital-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.status-bar {
  height: 8px;
  background: #9e9e9e; /* Pure gray for unavailable days */
}

/* Black top rectangle for available days */
.digital-calendar.available .status-bar {
  background: #000000;
}

.day-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: #333;
  background-color: #f8f8f8;
}



/* Course description section */
.course-description-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.course-description-section h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.course-description-section p {
  color: #4b5563;
  line-height: 1.6;
}

/* Custom Accordion Styles */
/* These styles enhance the shadcn/ui accordion component */
.accordion-content {
  padding: 0 1rem 1rem 1rem;
  text-align: left; /* Explicitly set left alignment */
}
.accordion-item {
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.accordion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.accordion-trigger {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: none;
  background: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-trigger:hover {
  color: #6e8efb;
}

.accordion-content {
  padding: 0 1rem 1rem 1rem;
}

/* Additional accordion styling for shadcn/ui components */
[data-state="open"] > .accordion-trigger {
  color: #6e8efb;
}

/* FAQ items */
.faq-item {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.faq-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.faq-question {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align:left;
}

.faq-answer {
  color: #4b5563;
}

/* Course actions section - Apply Now button */
.course-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
}

.enroll-button {
  background: #6e8efb;
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
}

.course-fee {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* Remove animations */
.course-detail-header,
.course-badges,
.course-image-gallery,
.course-info-card,
.course-description-section,
.course-outcomes-section,
.course-schedule-section,
.course-criteria-section,
.course-faq-section,
.organization-section,
.bottom-cta {
  opacity: 1;
  animation: none;
}

/* Basic hover effects without animations */
.back-button:hover {
  color: #4b6ce0;
}

.apply-button:hover {
  background-color: #4b6ce0;
}

/* Orientation-specific adjustments */
@media screen and (orientation: portrait) {
  /* Ensure indicators are visible in portrait mode */
  .carousel-indicators {
    display: flex;
    bottom: 15px;
  }

  .days-grid {
    display: flex;
    justify-content: space-between;
  }

  .digital-calendar {
    width: 32px;
    height: 45px;
  }
}

@media screen and (orientation: landscape) {
  /* Adjust for landscape mode */
  .course-image-gallery {
    height: 300px; /* Shorter in landscape */
  }

  /* Hide day indicators in landscape */
  .days-grid {
    display: none;
  }

  /* Adjust position of carousel indicators */
  .carousel-indicators {
    bottom: 8px;
  }

  .indicator {
    width: 20px;
    height: 4px;
  }
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 768px) {
  .course-detail-container {
    padding: 1rem;
  }

  .course-detail-header h1 {
    font-size: 2rem;
  }

  .course-image-gallery {
    height: 300px;
  }

  .carousel-button {
    width: 36px;
    height: 36px;
  }

  /* Make day calendars smaller on mobile */
  .digital-calendar {
    width: 28px;
    height: 40px;
  }

  .day-display {
    font-size: 10px;
  }
}

/* Add specific styling for content to fix navbar overlap */
.content {
  padding-top: 6rem; /* Add more space below the navbar */
  position: relative;
  z-index: 1; /* Ensure content appears above other elements */
}

/* Ensure the back button is visible */
.content .max-w-6xl {
  position: relative;
}
`;

interface CourseDetailProps {
  courses: {
    id: string;
    images: string[];
    title: string;
    titleMm?: string | null;
    subtitle: string;
    subtitleMm?: string | null;
    location: string;
    locationMm?: string | null;
    startDate: string;
    endDate?: string; // New field
    duration: string | number;
    durationMm?: string | number | null;
    schedule: string;
    scheduleMm?: string | null;
    fee?: string;
    feeMm?: string | null;
    feeAmount?: number; // New field
    feeAmountMm?: number | null; // New field
    ageMin?: number; // New field
    ageMinMm?: number | null; // New field
    ageMax?: number; // New field
    ageMaxMm?: number | null; // New field
    document?: string; // New field
    documentMm?: string | null; // New field
    availableDays: boolean[];
    description?: string;
    descriptionMm?: string | null;
    outcomes?: string[];
    outcomesMm?: string[] | null;
    scheduleDetails?: string;
    scheduleDetailsMm?: string | null;
    selectionCriteria?: string[];
    selectionCriteriaMm?: string[] | null;
    howToApply?: string[] | null;
    howToApplyMm?: string[] | null;
    badges: {
      text: string;
      color: string;
      backgroundColor: string;
    }[];
    faq?: {
      question: string;
      questionMm?: string | null;
      answer: string;
      answerMm?: string | null;
    }[];
    organizationInfo?: {
      name: string;
      description: string;
      phone: string;
      email: string;
      address: string;
      facebookPage?: string;
      district?: string; // New field
      province?: string; // New field
      latitude: number;
      longitude: number;
      mapLocation?: {
        // Keeping for backward compatibility
        lat: number;
        lng: number;
      };
    };
  }[];
}

// Helper function for localized string arrays
const getLocalizedArray = (
  enArray: string[] | null | undefined,
  mmArray: string[] | null | undefined,
  language: string
): string[] => {
  if (language === "mm" && mmArray && mmArray.length > 0) {
    return mmArray;
  }
  return enArray || [];
};

const CourseDetail: React.FC<CourseDetailProps> = ({ courses }) => {
  const { id } = useParams<{ id: string }>();
  const course = courses.find((c) => c.id === id);
  const { t, language } = useLanguage();
  const { translateBadge } = useBadgeTranslation();

  // Add CSS to head when component mounts
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = courseDetailStyles;
    document.head.appendChild(style);

    // Cleanup when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll position management
  useEffect(() => {
    // Only scroll to top if we're coming from a fresh load (not cached)
    // This prevents unwanted scrolling when cache is restored
    if (typeof window !== "undefined") {
      const hasCache = sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY);
      if (!hasCache) {
        window.scrollTo(0, 0);
      }
    }
  }, [id]); // Re-run this effect if the course ID changes

  // Format fee based on feeAmount if available, otherwise use legacy fee
  const formatFee = () => {
    if (course?.feeAmount === -1) {
      return null; // Don't display anything when -1 (hidden)
    }

    if (course?.feeAmount !== undefined) {
      // Use the new numeric fee amount
      const amount = course.feeAmount;
      if (amount === 0) return language === "mm" ? "အခမဲ့" : "Free";

      return new Intl.NumberFormat(language === "mm" ? "my" : "en", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 0,
      }).format(amount);
    } else if (course?.fee) {
      // Fall back to legacy string fee field
      return language === "mm" && course.feeMm ? course.feeMm : course.fee;
    }

    return null;
  };

  // Format duration based on type
  const formatDuration = () => {
    if (!course) return "";

    // Use localized duration if available
    const durationValue =
      language === "mm" &&
      course.durationMm !== undefined &&
      course.durationMm !== null
        ? course.durationMm
        : course.duration;

    // If duration is a number, format it with "months"
    if (typeof durationValue === "number") {
      return language === "mm"
        ? `${durationValue} လ`
        : `${durationValue} month${durationValue !== 1 ? "s" : ""}`;
    }

    // Otherwise return as string
    return durationValue;
  };

  // Format age range
  const formatAgeRange = () => {
    if (!course) return "";
    if (!course.ageMin && !course.ageMax) return "";

    const min =
      language === "mm" && course.ageMinMm !== undefined
        ? course.ageMinMm
        : course.ageMin;
    const max =
      language === "mm" && course.ageMaxMm !== undefined
        ? course.ageMaxMm
        : course.ageMax;

    if (min && !max) return `${min}+`;
    if (!min && max) return `0-${max}`;
    return `${min}-${max}`;
  };

  // if no course is found!!
  if (!course) {
    return (
      <div className="content py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("course.notfound")}</h1>
          <Button onClick={() => window.history.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("course.back")}
          </Button>
        </div>
      </div>
    );
  }

  // Back Button to Landing Page
  return (
    <div className="content mt-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Non-sticky back button that stays at the top */}
        <div className="relative z-10 bg-background py-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="border border-gray-300 bg-white hover:bg-gray-100 rounded-md shadow-sm"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("course.back")}
          </Button>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {language === "mm" && course.titleMm
              ? course.titleMm
              : course.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === "mm" && course.subtitleMm
              ? course.subtitleMm
              : course.subtitle}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {course.badges.map((badge, index) => (
            <Badge
              key={index}
              style={{
                backgroundColor: badge.backgroundColor,
                color: badge.color,
              }}
              className="py-1 px-3 text-sm font-normal"
            >
              {translateBadge(badge.text)}
            </Badge>
          ))}
        </div>

        {/* Image Gallery and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          {/* Enhanced Image Gallery with swipe support */}
          <div className="lg:col-span-3">
            <ImageCarousel
              images={course.images}
              altText={
                language === "mm" && course.titleMm
                  ? course.titleMm
                  : course.title
              }
              variant="fullsize"
              indicatorStyle="dots"
              aspectRatio="video"
            />
          </div>

          {/* Course Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("course.details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.location")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {language === "mm" && course.locationMm
                        ? course.locationMm
                        : course.location}
                    </p>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.startDate")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {course.startDate}
                    </p>
                  </div>
                </div>

                {/* End Date - NEW FIELD */}
                {course.endDate && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {language === "mm" ? "ပြီးဆုံးမည့်ရက်" : "End Date"}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {course.endDate}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.duration")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {formatDuration()}
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.schedule")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {language === "mm" && course.scheduleMm
                        ? course.scheduleMm
                        : course.schedule}
                    </p>
                  </div>
                </div>

                {/* Fee */}
                {(course.fee || course.feeAmount !== undefined) && (
                  <div className="flex items-start">
                    <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-muted-foreground">
                      ฿
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("course.fee")}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {formatFee() && (
                          <div className="fee-display-section">
                            {formatFee()}
                          </div>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Age Range - NEW FIELD */}
                {(course.ageMin !== undefined ||
                  course.ageMax !== undefined) && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {language === "mm" ? "အသက်" : "Age Range"}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {formatAgeRange()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Required Documents - NEW FIELD */}
                {(course.document || course.documentMm) && (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {language === "mm"
                          ? "လိုအပ်သော စာရွက်စာတမ်းများ"
                          : "Required Documents"}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {language === "mm" && course.documentMm
                          ? course.documentMm
                          : course.document}
                      </p>
                    </div>
                  </div>
                )}

                {/* Day Availability Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">
                    {t("course.availableDays")}
                  </h3>
                  <DayIndicator
                    days={[
                      t("course.days.sun"),
                      t("course.days.mon"),
                      t("course.days.tue"),
                      t("course.days.wed"),
                      t("course.days.thu"),
                      t("course.days.fri"),
                      t("course.days.sat"),
                    ]}
                    availableDays={course.availableDays}
                    size="medium"
                  />
                </div>
              </CardContent>
              <CardFooter>
                {/* <Button className="w-full">{t("course.apply")}</Button> */}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Course Details Accordion */}
        <div className="mb-10">
          <Accordion type="multiple" className="w-full">
            {/* Description Section */}
            {course.description && (
              <AccordionItem
                value="description"
                className="border rounded-md mb-3 px-4"
              >
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-lg font-semibold">
                      {t("course.description")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-muted-foreground" dir="auto">
                    {language === "mm" && course.descriptionMm
                      ? course.descriptionMm
                      : course.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Course Outcomes */}
            {course.outcomes && course.outcomes.length > 0 && (
              <AccordionItem
                value="outcomes"
                className="border rounded-md mb-3 px-4"
              >
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-lg font-semibold">
                      {t("course.learning.outcomes")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {(language === "mm" &&
                    course.outcomesMm &&
                    course.outcomesMm.length > 0
                      ? course.outcomesMm
                      : course.outcomes
                    ).map((outcome, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground"
                        dir="auto"
                      >
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Schedule Details */}
            {course.scheduleDetails && (
              <AccordionItem
                value="schedule"
                className="border rounded-md mb-3 px-4"
              >
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-lg font-semibold">
                      {t("course.schedule.details")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-muted-foreground" dir="auto">
                    {language === "mm" && course.scheduleDetailsMm
                      ? course.scheduleDetailsMm
                      : course.scheduleDetails}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Selection Criteria */}
            {course.selectionCriteria &&
              course.selectionCriteria.length > 0 && (
                <AccordionItem
                  value="criteria"
                  className="border rounded-md mb-3 px-4"
                >
                  <AccordionTrigger className="py-4">
                    <div className="flex items-center">
                      <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-lg font-semibold">
                        {t("course.selectionCriteria")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {(language === "mm" &&
                      course.selectionCriteriaMm &&
                      course.selectionCriteriaMm.length > 0
                        ? course.selectionCriteriaMm
                        : course.selectionCriteria
                      ).map((criteria, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground"
                          dir="auto"
                        >
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            {/* How to Apply Section - FIXED */}
            {((course.howToApply &&
              course.howToApply.length > 0 &&
              course.howToApply.some((step: string) => step.trim() !== "")) ||
              (course.howToApplyMm &&
                course.howToApplyMm.length > 0 &&
                course.howToApplyMm.some(
                  (step: string) => step.trim() !== ""
                ))) && (
              <AccordionItem
                value="howToApply"
                className="border rounded-md mb-3 px-4"
              >
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-lg font-semibold">
                      {language === "mm" ? "လျှောက်ထားပုံ" : "How to Apply"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {getLocalizedArray(
                      course.howToApply,
                      course.howToApplyMm,
                      language
                    )
                      .filter((step: string) => step.trim() !== "") // Filter out empty steps
                      .map((step: string, index: number) => (
                        <li
                          key={index}
                          className="text-muted-foreground"
                          dir="auto"
                        >
                          {step}
                        </li>
                      ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* FAQ Section */}
            {course.faq && course.faq.length > 0 && (
              <AccordionItem
                value="faq"
                className="border rounded-md mb-3 px-4"
              >
                <AccordionTrigger className="py-4">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-lg font-semibold">
                      {t("course.faq")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    {course.faq.map((item, index) => (
                      <div
                        key={index}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <h3 className="font-semibold mb-2" dir="auto">
                          {language === "mm" && item.questionMm
                            ? item.questionMm
                            : item.question}
                        </h3>
                        <p className="text-muted-foreground" dir="auto">
                          {language === "mm" && item.answerMm
                            ? item.answerMm
                            : item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Organization Info */}
        {course.organizationInfo && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{t("course.about.org")}</h2>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  {course.organizationInfo.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {course.organizationInfo.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <PhoneCall className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>{course.organizationInfo.phone}</span>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <a
                      href={`mailto:${course.organizationInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {course.organizationInfo.email}
                    </a>
                  </div>

                  {course.organizationInfo.facebookPage && (
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <a
                        href={course.organizationInfo.facebookPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("course.facebook")}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>
                      {course.organizationInfo.address}
                      {course.organizationInfo.district &&
                        `, ${course.organizationInfo.district}`}
                      {course.organizationInfo.province &&
                        `, ${course.organizationInfo.province}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-16 p-6 bg-muted rounded-lg">
          <div>
            <h3 className="text-xl font-bold">
              {language === "mm"
                ? "ဤသင်တန်းကို စိတ်ဝင်စားပါသလား?"
                : "Interested in this course?"}
            </h3>
            <p className="text-muted-foreground">
              {language === "mm"
                ? "လျှောက်ထားရန် သို့မဟုတ် ပိုမိုလေ့လာရန် အဖွဲ့အစည်းကို တိုက်ရိုက်ဆက်သွယ်ပါ"
                : "Contact the organization directly to apply or learn more"}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {t("course.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Course details cache constants
const COURSE_DETAILS_CACHE_KEY = "courseDetailsCache";
const COURSE_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CourseDetailsCache {
  courses: CourseDetailProps["courses"];
  timestamp: number;
}

export default function CoursePage() {
  const [courses, setCourses] = useState<CourseDetailProps["courses"]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheRestored, setCacheRestored] = useState(false);
  const coursesLengthRef = useRef(0);

  // Cache management functions
  const saveCourseDetailsCache = useCallback(
    (coursesData: CourseDetailProps["courses"]) => {
      if (typeof window === "undefined") return;

      try {
        const cache: CourseDetailsCache = {
          courses: coursesData,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(COURSE_DETAILS_CACHE_KEY, JSON.stringify(cache));
      } catch (error) {
        console.error("Error caching course details:", error);
      }
    },
    []
  );

  const restoreCourseDetailsCache = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const cached = sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY);

      if (!cached) {
        return false;
      }

      const cache: CourseDetailsCache = JSON.parse(cached);
      const age = Date.now() - cache.timestamp;

      // Check if cache is still valid
      if (age > COURSE_DETAILS_CACHE_DURATION) {
        sessionStorage.removeItem(COURSE_DETAILS_CACHE_KEY);
        return false;
      }

      // Restore course data immediately
      setCourses(cache.courses);
      coursesLengthRef.current = cache.courses.length;
      setLoading(false);

      return true;
    } catch (error) {
      console.error("Error restoring course details cache:", error);
      sessionStorage.removeItem(COURSE_DETAILS_CACHE_KEY);
      return false;
    }
  }, []);

  // Initial cache restoration
  useEffect(() => {
    const restored = restoreCourseDetailsCache();
    setCacheRestored(restored);
  }, [restoreCourseDetailsCache]);

  useEffect(() => {
    // Cache-first data fetching
    async function fetchCourses() {
      // If cache was restored, do background refresh
      if (cacheRestored) {
        try {
          const response = await fetch("/api/courses");
          if (response.ok) {
            const data = await response.json();
            // Only update if data is different (simple length check to avoid JSON.stringify)
            if (data.length !== coursesLengthRef.current) {
              setCourses(data);
              coursesLengthRef.current = data.length;
              saveCourseDetailsCache(data);
            }
          }
        } catch (error) {
          console.error("Course details background refresh failed:", error);
        }
        return;
      }

      // Normal fetch for first-time load or cache miss
      if (!cacheRestored && loading) {
        try {
          const response = await fetch("/api/courses");
          if (response.ok) {
            const data = await response.json();
            setCourses(data);
            coursesLengthRef.current = data.length;
            saveCourseDetailsCache(data);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchCourses();
  }, [cacheRestored, loading, saveCourseDetailsCache]); // Removed 'courses' from dependencies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pass the fetched courses to the existing CourseDetail component
  return <CourseDetail courses={courses} />;
}

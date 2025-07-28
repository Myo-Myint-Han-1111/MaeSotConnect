"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  MapPin,
  Clock,
  Calendar,
  BookOpen,
  Target,
  Info,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  PhoneCall,
  Mail,
  Facebook,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react";
import ImageCarousel from "@/components/common/ImageCarousel";
import DayIndicator from "@/components/common/DayIndicator";
import BadgeDisplay from "@/components/common/BadgeDisplay";
import Link from "next/link";

interface CourseDetail {
  id: string;
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  location: string;
  locationMm?: string;
  province?: string;
  district?: string;
  startDate: string;
  startDateMm?: string;
  endDate: string;
  endDateMm?: string;
  duration: number;
  durationMm?: number;
  schedule: string;
  scheduleMm?: string;
  feeAmount?: number;
  feeAmountMm?: number;
  ageMin?: number | null;
  ageMinMm?: number | null;
  ageMax?: number | null;
  ageMaxMm?: number | null;
  document?: string;
  documentMm?: string;
  availableDays: boolean[];
  description?: string;
  descriptionMm?: string;
  outcomes?: string[];
  outcomesMm?: string[];
  scheduleDetails?: string;
  scheduleDetailsMm?: string;
  selectionCriteria?: string[];
  selectionCriteriaMm?: string[];
  howToApply?: string[];
  howToApplyMm?: string[];
  applyButtonText?: string;
  applyButtonTextMm?: string;
  applyLink?: string;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  images: string[];
  faq?: {
    question: string;
    questionMm?: string;
    answer: string;
    answerMm?: string;
  }[];
  organizationInfo?: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebookPage?: string;
    district?: string;
    province?: string;
    latitude: number;
    longitude: number;
    logoImage?: string;
  };
}

interface CourseDetailComponentProps {
  course: CourseDetail;
}

export default function CourseDetailComponent({
  course,
}: CourseDetailComponentProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Date formatting function to convert to DD/MM/YYYY format
  const formatDateToDDMMYYYY = (dateString: string): string => {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }

      const year = date.getFullYear().toString(); // Get full year
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
      const day = date.getDate().toString().padStart(2, "0");

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if any error occurs
    }
  };

  // Helper function for localized date content with DD/MM/YYYY formatting
  const getLocalizedDateContent = (
    enContent: string | number | null | undefined,
    mmContent: string | number | null | undefined
  ): string => {
    const content =
      language === "mm" && mmContent !== undefined && mmContent !== null
        ? mmContent.toString()
        : enContent !== undefined && enContent !== null
        ? enContent.toString()
        : "";

    // Format the date to DD/MM/YYYY if content is not empty
    return content ? formatDateToDDMMYYYY(content) : content;
  };

  // Helper function for localized string arrays
  const getLocalizedArray = (
    enArray: string[] | null | undefined,
    mmArray: string[] | null | undefined
  ): string[] => {
    if (language === "mm" && mmArray && mmArray.length > 0) {
      return mmArray;
    }
    return enArray || [];
  };

  // Format fee as currency string
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "";

    // If amount is 0, show as "Free"
    if (amount === 0) return language === "mm" ? "အခမဲ့" : "Free";

    // Otherwise format as currency
    return new Intl.NumberFormat(language === "mm" ? "my-MM" : "en-US", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format duration string with appropriate units
  const formatDuration = (durationInDays?: number): string => {
    if (durationInDays === undefined || durationInDays === null) return "";

    if (durationInDays < 7) {
      // Less than a week, show as days
      return `${durationInDays} ${
        durationInDays === 1
          ? language === "mm"
            ? "ရက်"
            : "day"
          : language === "mm"
          ? "ရက်"
          : "days"
      }`;
    } else if (durationInDays < 30) {
      // Less than a month, show as weeks with decimal if needed
      const weeks = durationInDays / 7;
      const formattedWeeks =
        weeks % 1 === 0 ? weeks.toString() : weeks.toFixed(1);
      const weeksValue = parseFloat(formattedWeeks);

      return `${formattedWeeks} ${
        weeksValue === 1
          ? language === "mm"
            ? "ပတ်"
            : "week"
          : language === "mm"
          ? "ပတ်"
          : "week" // ← REMOVED PLURAL
      }`;
    } else if (durationInDays < 365) {
      // Less than a year, show as months with decimal precision
      const months = durationInDays / 30.44;

      // Show decimal only if it's significant
      const formattedMonths =
        months % 1 < 0.1 || months % 1 > 0.9
          ? Math.round(months).toString()
          : months.toFixed(1);

      return `${formattedMonths} ${
        language === "mm" ? "လ" : "month" // ← REMOVED PLURAL, always "month"
      }`;
    } else {
      // Show as years and months with more precision
      const totalMonths = durationInDays / 30.44;
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;

      const formattedRemainingMonths =
        remainingMonths < 0.1
          ? 0
          : remainingMonths % 1 < 0.1 || remainingMonths % 1 > 0.9
          ? Math.round(remainingMonths)
          : parseFloat(remainingMonths.toFixed(1));

      if (formattedRemainingMonths === 0) {
        return `${years} ${
          years === 1
            ? language === "mm"
              ? "နှစ်"
              : "year"
            : language === "mm"
            ? "နှစ်"
            : "year" // ← REMOVED PLURAL
        }`;
      } else {
        return `${years} ${
          years === 1
            ? language === "mm"
              ? "နှစ်"
              : "year"
            : language === "mm"
            ? "နှစ်"
            : "year" // ← REMOVED PLURAL
        } ${formattedRemainingMonths} ${
          language === "mm" ? "လ" : "month" // ← REMOVED PLURAL
        }`;
      }
    }
  };

  // Update the formatAgeRange function to be more strict
  const formatAgeRange = (min?: number | null, max?: number | null): string => {
    console.log("formatAgeRange called with min:", min, "max:", max);

    // Don't show anything if both are null/undefined or 0 or negative
    if (
      (min === null || min === undefined || min <= 0) &&
      (max === null || max === undefined || max <= 0)
    ) {
      console.log("Both values are invalid, returning empty string");
      return "";
    }

    // If we have both min and max (both > 0)
    if (
      min !== null &&
      min !== undefined &&
      min > 0 &&
      max !== null &&
      max !== undefined &&
      max > 0
    ) {
      console.log("Both values present:", min, max);
      return `${min}-${max} ${language === "mm" ? "နှစ်" : "years"}`;
    }
    // If we only have minimum age (> 0)
    else if (min !== null && min !== undefined && min > 0) {
      console.log("Only min value present:", min);
      return `${min}+ ${language === "mm" ? "နှစ်" : "years"}`;
    }
    // If we only have maximum age (> 0)
    else if (max !== null && max !== undefined && max > 0) {
      console.log("Only max value present:", max);
      return `${language === "mm" ? "အများဆုံး" : "Up to"} ${max} ${
        language === "mm" ? "နှစ်" : "years"
      }`;
    }

    console.log("No valid age values, returning empty string");
    return "";
  };

  return (
    <div className="content mt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="relative z-40 bg-background pt-6 py-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="border border-gray-300 bg-white hover:bg-gray-100 rounded-md"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("course.back")}
          </Button>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {getLocalizedDateContent(course.title, course.titleMm)}
          </h1>
          <p className="text-lg text-muted-foreground">
            {getLocalizedDateContent(course.subtitle, course.subtitleMm)}
          </p>
        </div>

        {/* Badges */}
        <BadgeDisplay badges={course.badges} size="medium" />

        {/* Image Gallery and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-3">
            <ImageCarousel
              images={course.images}
              altText={getLocalizedDateContent(course.title, course.titleMm)}
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
                      {course.province || course.district
                        ? course.district && course.province
                          ? `${course.district}, ${course.province}`
                          : course.district || course.province
                        : "Location information not available"}
                    </p>
                  </div>
                </div>

                {/* Date Range (Start & End Date) with DD/MM/YYYY format */}
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.dates")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {getLocalizedDateContent(
                        course.startDate,
                        course.startDateMm
                      )}
                      {course.endDate &&
                        ` - ${getLocalizedDateContent(
                          course.endDate,
                          course.endDateMm
                        )}`}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("course.duration")}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {language === "mm"
                        ? formatDuration(course.durationMm ?? course.duration)
                        : formatDuration(course.duration)}
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
                      {getLocalizedDateContent(
                        course.schedule,
                        course.scheduleMm
                      )}
                    </p>
                  </div>
                </div>

                {/* Age Range - Only show if at least one age limit is defined and greater than 0 */}
                {((course.ageMin !== null &&
                  course.ageMin !== undefined &&
                  course.ageMin > 0) ||
                  (course.ageMax !== null &&
                    course.ageMax !== undefined &&
                    course.ageMax > 0)) && (
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("course.ageRange")}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {language === "mm"
                          ? formatAgeRange(
                              course.ageMinMm ?? course.ageMin,
                              course.ageMaxMm ?? course.ageMax
                            )
                          : formatAgeRange(course.ageMin, course.ageMax)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Required Documents - Only show if documents are specified */}
                {(course.document && course.document.trim() !== "") ||
                (course.documentMm && course.documentMm.trim() !== "") ? (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("course.requiredDocuments")}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {getLocalizedDateContent(
                          course.document,
                          course.documentMm
                        )}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Fee - Updated to use new feeAmount field */}
                {(course.feeAmount !== undefined ||
                  course.feeAmountMm !== undefined) && (
                  <div className="flex items-start">
                    <div className="h-5 w-5 mr-2 mt-0.5 flex items-center justify-center text-muted-foreground">
                      ฿
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("course.fee")}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="auto">
                        {language === "mm"
                          ? formatCurrency(
                              course.feeAmountMm ?? course.feeAmount
                            )
                          : formatCurrency(course.feeAmount)}
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
            </Card>
          </div>
        </div>

        {/* Course Details Accordion */}
        <div className="mb-10">
          <Accordion type="multiple" className="w-full">
            {/* Description Section */}
            {(course.description || course.descriptionMm) && (
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
                  <p
                    className="text-muted-foreground whitespace-pre-line"
                    dir="auto"
                  >
                    {getLocalizedDateContent(
                      course.description,
                      course.descriptionMm
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Course Outcomes */}
            {((course.outcomes && course.outcomes.length > 0) ||
              (course.outcomesMm && course.outcomesMm.length > 0)) && (
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
                    {getLocalizedArray(course.outcomes, course.outcomesMm).map(
                      (outcome, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground"
                          dir="auto"
                        >
                          {outcome}
                        </li>
                      )
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Schedule Details */}
            {(course.scheduleDetails || course.scheduleDetailsMm) && (
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
                  <p
                    className="text-muted-foreground whitespace-pre-line"
                    dir="auto"
                  >
                    {getLocalizedDateContent(
                      course.scheduleDetails,
                      course.scheduleDetailsMm
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Selection Criteria */}
            {((course.selectionCriteria &&
              course.selectionCriteria.length > 0) ||
              (course.selectionCriteriaMm &&
                course.selectionCriteriaMm.length > 0)) && (
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
                    {getLocalizedArray(
                      course.selectionCriteria,
                      course.selectionCriteriaMm
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
                          {getLocalizedDateContent(
                            item.question,
                            item.questionMm
                          )}
                        </h3>
                        <p
                          className="text-muted-foreground whitespace-pre-line"
                          dir="auto"
                        >
                          {getLocalizedDateContent(item.answer, item.answerMm)}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* How to Apply Section - Standalone */}
        {((course.howToApply &&
          course.howToApply.length > 0 &&
          course.howToApply.some((step) => step.trim() !== "")) ||
          (course.howToApplyMm &&
            course.howToApplyMm.length > 0 &&
            course.howToApplyMm.some((step) => step.trim() !== ""))) && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              <ClipboardList className="h-6 w-6 inline mr-2 text-primary" />
              {language === "mm" ? "လျှောက်ထားပုံ" : "How to Apply"}
            </h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="list-decimal pl-6 space-y-3">
                  {getLocalizedArray(course.howToApply, course.howToApplyMm)
                    .filter((step) => step.trim() !== "")
                    .map((step, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground"
                        dir="auto"
                      >
                        {step}
                      </li>
                    ))}
                </ul>

                {/* Apply Button inside How to Apply section */}
                {(course.applyButtonText || course.applyButtonTextMm) && (
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-6 py-2 text-base"
                      onClick={() => {
                        if (course.applyLink) {
                          if (course.applyLink.startsWith("mailto:")) {
                            window.location.href = course.applyLink;
                          } else {
                            window.open(
                              course.applyLink,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }
                      }}
                      disabled={!course.applyLink}
                    >
                      {language === "mm" && course.applyButtonTextMm
                        ? course.applyButtonTextMm
                        : course.applyButtonText}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Organization Info */}
        {course.organizationInfo && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {t("about.organization")}
            </h2>
            <Card>
              <CardContent className="pt-6">
                {/* Organization Name and Logo Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-0">
                      {course.organizationInfo.name}
                    </h3>
                  </div>
                  {/* Logo - Always on the right */}
                  {course.organizationInfo.logoImage && (
                    <div className="flex-shrink-0">
                      <Image
                        src={course.organizationInfo.logoImage}
                        alt={`${course.organizationInfo.name} logo`}
                        width={160}
                        height={160}
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-lg border border-gray-200 bg-white p-1 sm:p-2"
                      />
                    </div>
                  )}
                </div>

                {/* Description - Same vertical spacing as other items */}
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    {course.organizationInfo.description}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <PhoneCall className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span className="break-all">
                      {course.organizationInfo.phone}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <Link
                      href={`mailto:${course.organizationInfo.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {course.organizationInfo.email}
                    </Link>
                  </div>

                  {course.organizationInfo.facebookPage && (
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                      <Link
                        href={course.organizationInfo.facebookPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {course.organizationInfo.facebookPage.replace(
                          "https://www.facebook.com/",
                          "facebook.com/"
                        )}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-muted-foreground break-words">
                      {course.organizationInfo?.address ||
                        (course.organizationInfo?.district &&
                        course.organizationInfo?.province
                          ? `${course.organizationInfo.district}, ${course.organizationInfo.province}`
                          : course.organizationInfo?.district ||
                            course.organizationInfo?.province ||
                            "Location information not available")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

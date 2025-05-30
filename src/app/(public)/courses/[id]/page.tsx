"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  // ADD the missing province and district fields
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
  ageMin?: number;
  ageMinMm?: number;
  ageMax?: number;
  ageMaxMm?: number;
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
  };
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // Less than a month, show as weeks
      const weeks = Math.round(durationInDays / 7);
      return `${weeks} ${
        weeks === 1
          ? language === "mm"
            ? "ပတ်"
            : "week"
          : language === "mm"
          ? "ပတ်"
          : "weeks"
      }`;
    } else if (durationInDays < 365) {
      // Less than a year, show as months
      const months = Math.round(durationInDays / 30);
      return `${months} ${
        months === 1
          ? language === "mm"
            ? "လ"
            : "month"
          : language === "mm"
          ? "လ"
          : "months"
      }`;
    } else {
      // Show as years and months
      const years = Math.floor(durationInDays / 365);
      const remainingDays = durationInDays % 365;
      const months = Math.round(remainingDays / 30);

      if (months === 0) {
        return `${years} ${
          years === 1
            ? language === "mm"
              ? "နှစ်"
              : "year"
            : language === "mm"
            ? "နှစ်"
            : "years"
        }`;
      } else {
        return `${years} ${
          years === 1
            ? language === "mm"
              ? "နှစ်"
              : "year"
            : language === "mm"
            ? "နှစ်"
            : "years"
        } ${months} ${
          months === 1
            ? language === "mm"
              ? "လ"
              : "month"
            : language === "mm"
            ? "လ"
            : "months"
        }`;
      }
    }
  };

  // Format age range
  const formatAgeRange = (min?: number, max?: number): string => {
    if (min === undefined && max === undefined) return "";

    if (min !== undefined && max !== undefined) {
      return `${min}-${max} ${language === "mm" ? "နှစ်" : "years"}`;
    } else if (min !== undefined) {
      return `${min}+ ${language === "mm" ? "နှစ်" : "years"}`;
    } else if (max !== undefined) {
      return `0-${max} ${language === "mm" ? "နှစ်" : "years"}`;
    }

    return "";
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCourse();
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="content py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="content py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("course.notfound")}</h1>
          <Button onClick={() => router.push("/")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("course.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="content mt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="relative z-40 bg-background pt-6 py-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="border border-gray-300 bg-white hover:bg-gray-100 rounded-md"
            onClick={() => router.push("/")}
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

                {/* Age Range - New field */}
                {(course.ageMin !== undefined ||
                  course.ageMax !== undefined) && (
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

                {/* Required Documents - New field */}
                {(course.document || course.documentMm) && (
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
                )}

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

        {/* Organization Info */}
        {course.organizationInfo && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {t("about.organization")}
            </h2>
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
                    <Link
                      href={`mailto:${course.organizationInfo.email}`}
                      className="text-primary hover:underline"
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
                        className="text-primary hover:underline"
                      >
                        {t("course.facebook")}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">
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
}

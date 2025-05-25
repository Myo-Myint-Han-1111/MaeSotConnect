"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "../ui/card";
// import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext";
import ImageCarousel from "../common/ImageCarousel";
import DayIndicator from "../common/DayIndicator";
import BadgeDisplay from "../common/BadgeDisplay";
import CourseInfoDisplay from "../common/CourseInfoDisplay";
import "./CourseCard.css";

export interface CourseCardProps {
  id: string;
  images: {
    id: string;
    url: string;
    courseId: string;
  }[];
  title: string;
  titleMm: string | null;
  subtitle: string;
  subtitleMm: string | null;
  // Note: These are now formatted strings, not the raw database types
  location: string;
  locationMm: string | null;
  startDate: string;
  startDateMm: string | null;
  duration: string;
  durationMm: string | null;
  schedule: string;
  scheduleMm: string | null;
  fee?: string;
  feeMm?: string | null;
  availableDays: boolean[];
  badges: {
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
    courseId: string;
  }[];
  // TODO: Ko Myo - Add these fields when applyByDate is added to database
  // applyByDate?: string;
  // applyByDateMm?: string | null;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  images,
  title,
  titleMm,
  subtitle,
  subtitleMm,
  badges,
  location,
  locationMm,
  startDate,
  startDateMm,
  duration,
  durationMm,
  schedule,
  scheduleMm,
  fee,
  feeMm,
  availableDays,
  // applyByDate, // TODO: Ko Myo - Uncomment when added to database
  // applyByDateMm, // TODO: Ko Myo - Uncomment when added to database
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();

  const handleNavigation = () => {
    router.push(`/courses/${id}`);
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Helper function to get localized content
  const getLocalizedContent = (enContent: string, mmContent: string | null) => {
    if (language === "mm" && mmContent) {
      return mmContent;
    }
    return enContent;
  };

  // Transform the images array to get just the URLs
  const imageUrls = images.map((img) => img.url);

  return (
    <Card className="course-card" onClick={handleNavigation}>
      <div className="carousel-container" onClick={handleCarouselClick}>
        <ImageCarousel
          images={imageUrls}
          altText={getLocalizedContent(title, titleMm)}
          variant="card"
          aspectRatio="video"
        />
      </div>

      <CardContent className="card-content">
        <h3 className="card-title" dir="auto">
          {getLocalizedContent(title, titleMm)}
        </h3>
        <p className="card-subtitle" dir="auto">
          {getLocalizedContent(subtitle, subtitleMm)}
        </p>

        <BadgeDisplay badges={badges} size="small" />

        <CourseInfoDisplay
          location={getLocalizedContent(location, locationMm)}
          startDate={getLocalizedContent(startDate, startDateMm)}
          duration={getLocalizedContent(duration, durationMm)}
          schedule={getLocalizedContent(schedule, scheduleMm)}
          fee={fee ? getLocalizedContent(fee, feeMm || null) : undefined}
          compact={true}
          showDescriptions={true} // Added this new prop
          // TODO: Ko Myo - Add this line when applyByDate is implemented
          // applyByDate={applyByDate ? getLocalizedContent(applyByDate, applyByDateMm) : undefined}
        />
        
        {/* <div className="ml-6">
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
            availableDays={availableDays}
            size="small"
          />
        </div> */}
      </CardContent>

      {/* <CardFooter className="see-more-container">
        {<Button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation();
          }}
          className="see-more-button cursor-pointer"
        >
          {t("course.seemore")}
        </Button>}
      </CardFooter> */}
    </Card>
  );
};

export default CourseCard;
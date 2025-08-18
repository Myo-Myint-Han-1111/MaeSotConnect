"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext";
import ImageCarousel from "../common/ImageCarousel";
// import DayIndicator from "../common/DayIndicator";
import BadgeDisplay from "../common/BadgeDisplay";
import CourseInfoDisplay from "../common/CourseInfoDisplay";
import { getCreatorInfo } from "../../lib/course-utils";
import "./CourseCard.css";

export interface CourseCardProps {
  slug: string;
  images: {
    id: string;
    url: string;
    courseId: string;
  }[];
  title: string;
  titleMm: string | null;
  startDate: string;
  startDateMm: string | null;
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  duration: string;
  durationMm: string | null;
  fee?: string | null;
  feeMm?: string | null;
  badges: {
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
    courseId: string;
  }[];
  organizationInfo?: {
    name: string;
  } | null;
  createdByUser?: {
    id: string;
    name: string;
    image: string | null;
    role: string;
    advocateProfile?: {
      publicName: string | null;
      avatarUrl: string | null;
      status: string;
    } | null;
  } | null;
  district?: string | null;
  province?: string | null;
  showSwipeHint?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  slug,
  images,
  title,
  titleMm,
  badges,
  startDate,
  startDateMm,
  applyByDate,
  applyByDateMm,
  estimatedDate,
  estimatedDateMm,
  duration,
  durationMm,
  fee,
  feeMm,
  organizationInfo,
  createdByUser,
  district,
  province,
  showSwipeHint = true,
}) => {
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleNavigation = () => {
    router.push(`/courses/${slug}`);
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getLocalizedContent = (enContent: string, mmContent: string | null) => {
    if (language === "mm" && mmContent) {
      return mmContent;
    }
    return enContent;
  };

  const imageUrls = useMemo(() => images.map((img) => img.url), [images]);

  const creatorInfo = useMemo(
    () => getCreatorInfo(createdByUser, t("course.anonymousYouthAdvocate")),
    [createdByUser, t]
  );


  return (
    <Card className="course-card" onClick={handleNavigation}>
      <div className="carousel-container" onClick={handleCarouselClick}>
        <ImageCarousel
          images={imageUrls}
          altText={getLocalizedContent(title, titleMm)}
          variant="card"
          aspectRatio="video"
          showSwipeHint={showSwipeHint}
        />
      </div>

      <CardContent className="card-content">
        <h3 className="card-title" dir="auto">
          {getLocalizedContent(title, titleMm)}
        </h3>
        <p className="card-subtitle" dir="auto">
          {organizationInfo?.name}
        </p>

        <BadgeDisplay badges={badges} size="small" />

        <CourseInfoDisplay
          location={[district, province].filter(Boolean).join(", ") || ""}
          startDate={getLocalizedContent(startDate, startDateMm)}
          applyByDate={
            applyByDate
              ? getLocalizedContent(applyByDate, applyByDateMm || null)
              : undefined
          }
          estimatedDate={estimatedDate}
          estimatedDateMm={estimatedDateMm}
          duration={getLocalizedContent(duration, durationMm)}
          fee={fee ? getLocalizedContent(fee, feeMm || null) : undefined}
          compact={true}
          showDescriptions={true}
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

      <CardFooter className="see-more-container">
        {creatorInfo && (
          <div className="added-by-section">
            <span className="added-by-text">{t("course.addedBy")}</span>
            <div className="creator-info">
              {creatorInfo.image && (
                <Image
                  src={creatorInfo.image}
                  alt={creatorInfo.name}
                  width={32}
                  height={32}
                  className="creator-avatar"
                />
              )}
              <div className="creator-details">
                <span className="creator-name">{creatorInfo.name}</span>
              </div>
            </div>
          </div>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation();
          }}
          variant="ghost"
          size="sm"
          className="see-more-button cursor-pointer"
        >
          {t("course.seemore")}
          <svg
            className="see-more-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

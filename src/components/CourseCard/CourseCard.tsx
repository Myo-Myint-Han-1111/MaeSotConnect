"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext";
import ImageCarousel from "../common/ImageCarousel";
// import DayIndicator from "../common/DayIndicator";
import BadgeDisplay from "../common/BadgeDisplay";
import CourseInfoDisplay from "../common/CourseInfoDisplay";
import "./CourseCard.css";

export interface CourseCardProps {
  id: string;
  slug: string;
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

  startDate: string;
  startDateMm: string | null;
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  logoImage?: string | null;
  duration: string;
  durationMm: string | null;
  // schedule: string;
  // scheduleMm: string | null;
  fee?: string | null;
  feeMm?: string | null;
  availableDays: boolean[];
  badges: {
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
    courseId: string;
  }[];
  organizationInfo?: {
    id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebookPage?: string;
    latitude: number;
    longitude: number;
    district?: string;
    province?: string;
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
  createdAt?: string;
  // TODO: Ko Myo - Add these fields when applyByDate is added to database
  // applyByDate?: string;
  // applyByDateMm?: string | null;
  district?: string | null;
  province?: string | null;
  showSwipeHint?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id, // eslint-disable-line @typescript-eslint/no-unused-vars
  slug,
  images,
  title,
  titleMm,
  // subtitle,
  // subtitleMm,

  badges,

  startDate,
  startDateMm,
  applyByDate,
  applyByDateMm,
  estimatedDate,
  estimatedDateMm,
  duration,
  durationMm,
  // schedule,
  // scheduleMm,
  fee,
  feeMm,
  organizationInfo,
  createdByUser,
  createdAt,
  // availableDays,
  // applyByDate, // TODO: Ko Myo - Uncomment when added to database
  // applyByDateMm, // TODO: Ko Myo - Uncomment when added to database
  district,
  province,
  showSwipeHint = true,
}) => {
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleNavigation = () => {
    // Note: Page state is now automatically saved by the main page component
    // No need to save individual slug - full state persistence handles this
    router.push(`/courses/${slug}`);
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

  // Helper function to get creator display information
  const getCreatorInfo = () => {
    if (!createdByUser) {
      // When createdBy is null, show as anonymous youth advocate
      return {
        name: t("course.anonymousYouthAdvocate"),
        image: "/images/AnonYouthAdvocate.png",
        role: "YOUTH_ADVOCATE",
      };
    }
    
    // For youth advocates, use their publicName from profile if available
    if (createdByUser.role === 'YOUTH_ADVOCATE' && createdByUser.advocateProfile) {
      const profile = createdByUser.advocateProfile;
      if (profile.status === 'APPROVED') {
        return {
          name: profile.publicName || t("course.anonymousYouthAdvocate"),
          image: profile.avatarUrl || "/images/AnonYouthAdvocate.png",
          role: createdByUser.role,
        };
      }
    }
    
    // For organization admins and platform admins, use their regular profile
    return {
      name: createdByUser.name,
      image: createdByUser.image,
      role: createdByUser.role,
    };
  };

  const creatorInfo = getCreatorInfo();

  // Format date for display
  const formatDateAdded = (dateStr?: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "mm" ? "my-MM" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
          estimatedDate={estimatedDate} // Add this line
          estimatedDateMm={estimatedDateMm} // Add this line
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
                {createdAt && (
                  <span className="creator-date">on {formatDateAdded(createdAt)}</span>
                )}
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

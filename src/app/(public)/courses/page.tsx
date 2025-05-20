"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
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
  padding-top: 9rem; /* Add more space below the navbar */
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
    subtitle: string;
    badges: {
      text: string;
      color: string;
      backgroundColor: string;
    }[];
    location: string;
    startDate: string;
    duration: string;
    schedule: string;
    fee?: string;
    availableDays: boolean[];
    description?: string;
    outcomes?: string[];
    scheduleDetails?: string;
    selectionCriteria?: string[];
    faq?: {
      question: string;
      answer: string;
    }[];
    organizationInfo?: {
      name: string;
      description: string;
      phone: string;
      email: string;
      address: string;
      facebookPage?: string;
      mapLocation: {
        lat: number;
        lng: number;
      };
    };
  }[];
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courses }) => {
  const { id } = useParams<{ id: string }>();
  const course = courses.find((c) => c.id === id);
  const { t } = useLanguage();

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

  // This effect will run when the component mounts
  useEffect(() => {
    // Scroll to the top of the page
    window.scrollTo(0, 0);
  }, [id]); // Re-run this effect if the course ID changes

  // Translate badge text
  const translateBadge = (badgeText: string) => {
    if (badgeText === "Language") return t("badge.language");
    if (badgeText === "In-Person") return t("badge.inperson");
    if (badgeText === "Free") return t("badge.free");
    if (badgeText === "Vocational") return t("badge.vocational");
    if (badgeText === "Internship") return t("badge.internship");
    if (badgeText === "Technology") return t("badge.technology");
    if (badgeText === "Beginner") return t("badge.beginner");
    return badgeText;
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
    <div className="content">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Back button positioned normally now that we have proper spacing */}
        <div className="mb-8 mt-4">
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
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.subtitle}</p>
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
              altText={course.title}
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
                    <p className="text-sm text-muted-foreground">
                      {course.location}
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
                    <p className="text-sm text-muted-foreground">
                      {course.startDate}
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
                    <p className="text-sm text-muted-foreground">
                      {course.duration}
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
                    <p className="text-sm text-muted-foreground">
                      {course.schedule}
                    </p>
                  </div>
                </div>

                {/* Day Availability Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">
                    {t("course.availableDays")}
                  </h3>
                  <DayIndicator
                    days={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
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
                  <p className="text-muted-foreground">{course.description}</p>
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
                    {course.outcomes.map((outcome, index) => (
                      <li key={index} className="text-muted-foreground">
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
                  <p className="text-muted-foreground">
                    {course.scheduleDetails}
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
                      {course.selectionCriteria.map((criteria, index) => (
                        <li key={index} className="text-muted-foreground">
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
                        <h3 className="font-semibold mb-2">{item.question}</h3>
                        <p className="text-muted-foreground">{item.answer}</p>
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
                        {course.organizationInfo.name} Facebook Page
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>{course.organizationInfo.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        {/* Bottom CTA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-16 p-6 bg-muted rounded-lg">
          <div>
            <h3 className="text-xl font-bold">{t("course.readyToJoin")}</h3>
            <p className="text-muted-foreground">
              {t("course.applyDescription")}
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

export default CourseDetail;

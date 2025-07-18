"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "../../../components/ui/button";
import { ChevronLeft } from "lucide-react";

const About: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="relative z-10 bg-background py-4 pt-6 max-w-4xl mx-auto px-4">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed py-4">
            {t("about.mission.p1")}
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed py-2">
            Ko Myo teamed up with Peter in 2025 to develop a web app that solves this problem by creating a centralized, user-friendly platform to search, filter, and compare vocational training programs, language courses, and skill development opportunities. It is being developed as an{" "}
            <a 
              href="https://github.com/Myo-Myint-Han-1111/MaeSotConnect" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              open source project
            </a>{" "}
            and is currently self-funded.
          </p>
        </div>

        {/* Team Photo Section */}
        <div className="mb-16">
          <div className="relative w-full max-w-2xl mx-auto">
            <Image
              src="/images/KoMyo_Peter_TeamPhoto.jpeg"
              alt="Team Photo - Ko Myo and Peter"
              width={800}
              height={600}
              className="rounded-lg shadow-sm object-cover w-full"
              style={{ aspectRatio: "4/3" }}
            />
          </div>
        </div>

        {/* Team Profiles */}
        <div className="space-y-12 mb-16">
          {/* About Ko Myo */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              About Ko Myo
            </h2>
            <p className="text-muted-foreground leading-relaxed text-center">
              Ko Myo is a fullstack developer sharpening his skills through open-source projects that benefit Thai and Myanmar youth. He holds a bachelors in electrical engineering and is currently attending online classes in React, Javascript, and modern backend frameworks. He is passionate about education and technology and supporting digital literacy in rural communities.
            </p>
          </div>
          
          {/* About Peter */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              About Peter
            </h2>
            <p className="text-muted-foreground leading-relaxed text-center">
              Peter is currently a graduate student in Boston supporting the development of ThailandStudyGuide part-time. He works to build bi-partisan constituencies that support youth education in conflict-affected settings. Peter worked in Mae Sot for several years, supporting local education organizations and teaching research and computer science part-time to youth.
            </p>
          </div>
          
          {/* Contact */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Contact
            </h2>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                <a href="mailto:contact@thailandstudyguide.com" className="text-primary hover:text-primary/80 underline">
                  contact@thailandstudyguide.com
                </a>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're currently looking for organizations and individuals who share our mission of supporting youth education in Thailand. If you have feedback about the app, or would like to collaborate, please don't hesitate to send us an email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
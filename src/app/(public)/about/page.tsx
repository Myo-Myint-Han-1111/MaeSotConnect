"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "../../../components/ui/button";
import { ChevronLeft } from "lucide-react";

const About: React.FC = () => {
  const { t, language } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="relative z-10 bg-background py-4 pt-4 max-w-4xl mx-auto px-4">
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
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {t("about.title")}
          </h1>
          
          {/* FIRST PARAGRAPH */}
          <p className="text-lg text-muted-foreground leading-relaxed py-4">
            {t("about.mission.p1")}
          </p>
          
          {/* SECOND PARAGRAPH (with the link) */}
          <p className="text-lg text-muted-foreground leading-relaxed py-2">
            {t("about.mission.p2.part1")}{" "}
            <a 
              href="https://github.com/Myo-Myint-Han-1111/MaeSotConnect" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              {t("about.mission.p2.link")}
            </a>{" "}
            {t("about.mission.p2.part2")}
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
        <div className="space-y-12 mb-16 max-w-2xl mx-auto">
          {/* About Ko Myo */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {t("about.komyo.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-center">
              {t("about.komyo.content")}
            </p>
          </div>
          
          {/* About Peter */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {t("about.peter.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-center">
              {t("about.peter.content")}
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {t("about.contact.title")}
            </h2>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                <a href={`mailto:${t("about.contact.email")}`} className="text-primary hover:text-primary/80 underline">
                  {t("about.contact.email")}
                </a>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.contact.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">
                  JumpStudy.org
                </span>
              </Link>
            </div>

            <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "ပင်မစာမျက်နှာ" : "Home"}
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "အကြောင်း" : "About Us"}
              </Link>
              <Link
                href="/youthadvocates"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "လူငယ်ကိုယ်စားလှယ်များ" : "Youth Advocates"}
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} JumpStudy.org. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
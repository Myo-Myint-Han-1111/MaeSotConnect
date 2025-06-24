"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useRouter } from "next/navigation";

import { Button } from "../../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const About: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();

  // Sample team data
  const teamMembers = [
    {
      name: "Peter Grunawalt",
      role: "Main Developer",
      bio: "John has over 10 years of experience in community development and education.",
      image: "/team/placeholder.jpg",
    },
    {
      name: "Ko Myo",
      role: "Developer",
      bio: "Jane specializes in curriculum development and has worked with diverse communities across Thailand.",
      image: "/team/placeholder.jpg",
    },
    {
      name: "Ko Phillip",
      role: "Consultant",
      bio: "David builds relationships with local businesses and organizations to create opportunities for our community.",
      image: "/team/placeholder.jpg",
    },
  ];

  return (
    <div className="content">
      {/* Back Button */}
      <div className="relative z-10 bg-background py-4 pt-6 max-w-6xl mx-auto px-4">
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

      <section className="max-w-6xl mx-auto px-4 py-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">
              About Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mission Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {t("about.mission.title")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("about.mission.p1")}
              </p>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">
                  {t("about.platform.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("about.platform.content")}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">
                  {t("about.vision.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("about.vision.content")}
                </p>
              </div>
            </div>

            {/* Team Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">
                {t("about.team.title")}
              </h2>
              <p className="text-muted-foreground mb-6">
                Meet the dedicated professionals behind our organization
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="h-32 w-32 rounded-full bg-muted overflow-hidden mb-4">
                      {/* Fallback div in case image fails to load */}
                      <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                        {member.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// Add default export for Next.js page component
export default About;

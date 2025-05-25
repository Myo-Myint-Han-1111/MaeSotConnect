"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { useRouter } from "next/navigation";

import { Button } from "../../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Shield, Lightbulb, Users } from "lucide-react";

// Define any styles that can't be easily converted to Tailwind
const styles = {
  iconContainer: {
    height: "4rem",
    width: "4rem",
    borderRadius: "100%",
    backgroundColor: "rgba(var(--primary), 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
};

const About: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter(); // Initialize the router hook

  // Sample team data
  const teamMembers = [
    {
      name: "John Doe",
      role: "Director",
      bio: "John has over 10 years of experience in community development and education.",
      image: "/team/placeholder.jpg",
    },
    {
      name: "Jane Smith",
      role: "Program Manager",
      bio: "Jane specializes in curriculum development and has worked with diverse communities across Thailand.",
      image: "/team/placeholder.jpg",
    },
    {
      name: "David Wong",
      role: "Outreach Coordinator",
      bio: "David builds relationships with local businesses and organizations to create opportunities for our community.",
      image: "/team/placeholder.jpg",
    },
    {
      name: "Maria Rodriguez",
      role: "Education Specialist",
      bio: "Maria has extensive experience in language education and vocational training programs.",
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
        <Tabs defaultValue="mission" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[300px] mx-auto mb-4 p-1 rounded-md ">
            <TabsTrigger value="mission">Our Mission</TabsTrigger>
            <TabsTrigger value="team">Our Team</TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t("about.mission.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t("about.mission.p1")}</p>
                <p className="text-muted-foreground">{t("about.mission.p2")}</p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="flex flex-col items-center text-center">
                    <div style={styles.iconContainer}>
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Trust</h3>
                    <p className="text-sm text-muted-foreground">
                      Building strong relationships based on reliability and
                      integrity.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div style={styles.iconContainer}>
                      <Lightbulb className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Innovation</h3>
                    <p className="text-sm text-muted-foreground">
                      Finding creative solutions to meet the needs of our
                      community.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div style={styles.iconContainer}>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Bringing people together to create opportunities for
                      growth and learning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t("about.team.title")}
                </CardTitle>
                <CardDescription>
                  Meet the dedicated professionals behind our organization
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

// Add default export for Next.js page component
export default About;

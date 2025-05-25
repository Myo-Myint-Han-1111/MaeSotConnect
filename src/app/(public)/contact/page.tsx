"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { Button } from "../../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { PhoneCall, Mail, Facebook } from "lucide-react";

const ContactUs: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="content">
      {/* Back Button */}
      <div className="relative z-10 bg-background pt-6 max-w-6xl mx-auto px-4">
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

      <section className="section py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex items-center pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PhoneCall className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {t("contact.phone.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("contact.phone.text")}
                </p>
                <a
                  href="tel:+951234567890"
                  className="text-primary hover:underline font-medium"
                >
                  +95 123 456 7890
                </a>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex items-center pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {t("contact.email.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("contact.email.text")}
                </p>
                <a
                  href="mailto:info@maesotconnect.com"
                  className="text-primary hover:underline font-medium"
                >
                  info@maesotconnect.com
                </a>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex items-center pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Facebook className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {t("contact.facebook.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("contact.facebook.text")}
                </p>
                <a
                  href="https://facebook.com/maesotconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  @maesotconnect
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

// Add default export for Next.js page component
export default ContactUs;

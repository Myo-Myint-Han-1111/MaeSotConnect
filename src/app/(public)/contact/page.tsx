"use client";

import React from "react";
import { useLanguage } from "../../../context/LanguageContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { PhoneCall, Mail, Facebook, MapPin } from "lucide-react";

const ContactUs: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="content">
      <section className="hero-section">
        <h1 className="text-4xl font-bold text-white">{t("contact.title")}</h1>
        <p className="text-xl text-white max-w-2xl mx-auto mt-2">
          {t("contact.subtitle")}
        </p>
      </section>

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

      <section className="section py-12 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-1 text-center">
                {t("contact.location.title")}
              </h2>
            </div>

            <div className="w-full h-[400px] bg-card rounded-lg p-4 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p>{t("contact.location.maptext")}</p>
                <p className="text-sm mt-2">
                  Google Maps integration would be here
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Add default export for Next.js page component
export default ContactUs;

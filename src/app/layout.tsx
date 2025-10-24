// src/app/layout.tsx
import React from "react";
import { Metadata } from "next";
import ClientProviders from "@/components/providers/ClientProviders";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://jumpstudy.org")
  ),
  title: {
    default: "JumpStudy.org - Educational Opportunities in Thailand",
    template: "%s | JumpStudy.org",
  },
  description:
    "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
  keywords: [
    "Thailand education",
    "Myanmar community Thailand",
    "training programs",
    "courses",
    "youth advocates",
    "educational opportunities",
    "Mae Sot",
    "migrant education",
  ],
  authors: [{ name: "JumpStudy.org" }],
  creator: "JumpStudy.org",
  publisher: "JumpStudy.org",

  // Open Graph (optimized for Facebook)
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["my_MM"], // For Myanmar users
    url: "/",
    title: "JumpStudy.org - Educational Opportunities in Thailand",
    description:
      "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
    siteName: "JumpStudy.org",
    images: [
      {
        url: "/images/og-default.jpg", // We'll create this optimized image
        width: 1200,
        height: 630,
        alt: "JumpStudy.org - Educational Opportunities in Thailand",
        type: "image/jpeg",
      },
      {
        url: "/images/JumpStudyLogo.svg", // Fallback
        width: 1200,
        height: 630,
        alt: "JumpStudy.org Logo",
        type: "image/svg+xml",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "JumpStudy.org - Educational Opportunities in Thailand",
    description:
      "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
    images: ["/images/JumpStudyLogo.svg"],
    creator: "@jumpstudy_org",
    site: "@jumpstudy_org",
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },

  // Additional metadata
  robots: {
    index: process.env.NODE_ENV === "production",
    follow: true,
    googleBot: {
      index: process.env.NODE_ENV === "production",
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add these when you set up Search Console)
  // verification: {
  //   google: "your-google-verification-code",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

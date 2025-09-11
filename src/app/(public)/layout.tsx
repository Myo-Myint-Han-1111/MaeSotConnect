import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "JumpStudy.org",
  description: "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
  openGraph: {
    title: "JumpStudy.org | Educational Opportunities in Thailand",
    description: "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
    type: "website",
    images: [
      {
        url: "/images/JumpStudyLogo.svg",
        width: 1200,
        height: 630,
        alt: "JumpStudy.org - Educational Opportunities in Thailand",
      },
    ],
  },
  twitter: {
    title: "Educational Opportunities in Thailand | JumpStudy.org", 
    description: "Discover training programs, courses, and educational opportunities in Thailand. Connect with youth advocates and find the right path for your future.",
  },
};

// Brand configuration
const brand = {
  name: "JumpStudy.org",
  logo: "/images/JumpStudyLogo.svg",
};

// Navigation items (now used in footer, not in Navbar)
const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <Navbar brand={brand} items={navItems} />
      <main className="page-transition-container">{children}</main>
    </div>
  );
}
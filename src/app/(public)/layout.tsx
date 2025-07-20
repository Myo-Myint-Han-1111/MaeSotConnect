import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";

// Brand configuration
const brand = {
  name: "ThailandStudyGuide.org",
  logo: "/images/studyinthailand.svg",
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
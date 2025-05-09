import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";

// Brand configuration
const brand = {
  name: "Mae Sot Connect",
  logo: "/images/maesotconnect.png",
};

// Navigation items
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
      <div className="page-transition-container">{children}</div>
    </div>
  );
}

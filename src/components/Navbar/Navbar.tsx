"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  name: string;
  path: string;
}

interface BrandProps {
  name: string;
  logo: string;
}

interface NavbarProps {
  brand: BrandProps;
  items: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ brand }) => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  // Check if we're on the home page
  const isHomePage = pathname === "/";


  return (
    <header
      className={`relative w-full z-50 transition-colors duration-300 ${
        isHomePage ? "bg-transparent" : "bg-[#4257b2]"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/images/JumpStudyLogo.svg"
              alt={brand.name}
              width={32}
              height={32}
              className="h-10 w-auto"
              style={{ filter: 'drop-shadow(none)' }}
              unoptimized={true}
              priority={true}
            />
          </Link>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - only on home page */}
            {isHomePage && <ThemeToggle />}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLanguage(language === "en" ? "mm" : "en")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border ${
                  isHomePage 
                    ? "border-white/30 text-white/70 hover:bg-white/20 hover:text-white"
                    : "border-white/30 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {language === "en" ? "မြန်မာ" : "EN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
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

  // Check if we're on a page that needs the dark navbar style
  const isAlternateStyle =
    pathname.startsWith("/about") || pathname.startsWith("/courses/");

  const changeLanguage = (value: string) => {
    if (value === "en" || value === "mm") {
      setLanguage(value as "en" | "mm");
    }
  };

  return (
    <header
      className={`relative w-full z-50 transition-colors duration-300 ${
        isAlternateStyle ? "bg-[#4257b2] dark:bg-gray-900" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <Link href="/" className="transition-transform hover:scale-105">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={32}
                height={32}
                className="h-10 w-auto"
                unoptimized={true}
                priority={true}
              />
            )}
          </Link>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <div>
              <Tabs
                defaultValue={language}
                value={language}
                onValueChange={changeLanguage}
                className="border rounded-md overflow-hidden border-white/30"
              >
                <TabsList className="bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="en"
                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-sm
                      ${
                        language === "en"
                          ? "bg-white text-gray-900 font-semibold shadow-sm"
                          : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    ENG
                  </TabsTrigger>
                  <TabsTrigger
                    value="mm"
                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-sm
                      ${
                        language === "mm"
                          ? "bg-white text-gray-900 font-semibold shadow-sm"
                          : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    မြန်မာ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

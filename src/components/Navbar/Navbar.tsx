"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Sheet } from "../ui/sheet";
import {
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Menu, X } from "lucide-react";

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

export const Navbar: React.FC<NavbarProps> = ({ brand, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navbarRef = useRef<HTMLDivElement>(null);

  // Track current path to highlight active links
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    // Update currentPath when component mounts and when URL changes
    setCurrentPath(window.location.pathname);

    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Handle scroll effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const changeLanguage = (value: string) => {
    if (value === "en" || value === "mm") {
      setLanguage(value as "en" | "mm");
      setIsOpen(false);
    }
  };

  return (
    <header
      ref={navbarRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b shadow-sm" // Explicit white background when scrolled
          : "bg-white" // Explicit white background when not scrolled
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={32}
                height={32}
                className="h-8 w-auto"
                unoptimized={true}
                priority={true}
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPath === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.path === "/"
                  ? t("nav.home")
                  : item.path === "/about"
                  ? t("nav.about")
                  : item.path === "/contact"
                  ? t("nav.contact")
                  : item.name}
              </Link>
            ))}
          </nav>

          {/* Language Switcher and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Language Selector using Tabs with custom styling */}
            <div>
              <Tabs
                defaultValue={language}
                value={language}
                onValueChange={changeLanguage}
                className="border rounded-md overflow-hidden"
              >
                <TabsList className="bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="en"
                    className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-sm data-[state=active]:text-white data-[state=active]:bg-blue-500 data-[state=active]:shadow-none ${
                      language === "en" ? "ring-2 ring-blue-500 ring-inset" : ""
                    }`}
                  >
                    ENG
                  </TabsTrigger>
                  <TabsTrigger
                    value="mm"
                    className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-sm data-[state=active]:text-white data-[state=active]:bg-blue-500 data-[state=active]:shadow-none ${
                      language === "mm" ? "ring-2 ring-blue-500 ring-inset" : ""
                    }`}
                  >
                    MM
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[250px] sm:w-[300px] bg-white border-l"
                closeIcon={false}
              >
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>

                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={24}
                        height={24}
                        className="h-6 w-auto mr-2"
                        unoptimized={true}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <nav className="flex flex-col space-y-4">
                    {items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.path}
                        className={`px-2 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 rounded-md ${
                          currentPath === item.path
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.path === "/"
                          ? t("nav.home")
                          : item.path === "/about"
                          ? t("nav.about")
                          : item.path === "/contact"
                          ? t("nav.contact")
                          : item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

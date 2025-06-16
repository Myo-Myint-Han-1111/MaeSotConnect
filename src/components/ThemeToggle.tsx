"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark") {
      setTheme(value);
    }
  };

  return (
    <Tabs
      value={theme}
      onValueChange={handleThemeChange}
      className="border rounded-md overflow-hidden border-white/30"
    >
      <TabsList className="bg-transparent p-0 h-auto">
        <TabsTrigger
          value="light"
          className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-sm flex items-center gap-1
            ${
              theme === "light"
                ? "bg-white text-gray-900 font-semibold shadow-sm"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
        >
          <Sun
            className={`h-3 w-3 ${
              theme === "light"
                ? "text-gray-900"
                : "text-white/70 group-hover:text-white"
            }`}
          />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-sm flex items-center gap-1
            ${
              theme === "dark"
                ? "bg-white text-gray-900 font-semibold shadow-sm"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            }`}
        >
          <Moon
            className={`h-3 w-3 ${
              theme === "dark"
                ? "text-gray-900"
                : "text-white/70 group-hover:text-white"
            }`}
          />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

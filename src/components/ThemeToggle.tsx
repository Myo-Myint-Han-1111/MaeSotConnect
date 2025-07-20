"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium transition-all duration-200 rounded-sm flex items-center gap-1 border border-white/30 bg-transparent text-white/70 hover:text-white hover:bg-white/10"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-3 w-3" />
      ) : (
        <Sun className="h-3 w-3" />
      )}
    </button>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts Arabic numerals (0-9) to Myanmar numerals (၀-၉)
 * @param num The number to convert
 * @returns A string with Myanmar numerals
 */
export function convertToMyanmarNumber(num: number): string {
  const myanmarNumerals = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  return num
    .toString()
    .split("")
    .map((digit) =>
      isNaN(parseInt(digit)) ? digit : myanmarNumerals[parseInt(digit)]
    )
    .join("");
}

// This utils.ts file provides utility functions for the Mae Sot Connect application:

// 1. **Class Name Utility (`cn`)**:
//    - Combines multiple CSS class names using clsx
//    - Resolves conflicts with tailwind-merge
//    - Helps with conditional class application in components
//    - Accepts any number of class values as arguments

// 2. **Myanmar Number Converter**:
//    - Transforms standard Arabic numerals (0-9) to Myanmar numerals (၀-၉)
//    - Takes a number input and returns a string with Myanmar characters
//    - Handles each digit individually, preserving non-numeric characters
//    - Used for displaying numbers appropriately in the Myanmar language UI

// These utilities enhance the application by providing consistent class name handling and cultural/language adaptation for numeric displays.

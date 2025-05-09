// src/app/layout.tsx
import React from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/context/ToastContext"; // Add this import

import "./globals.css";

export const metadata = {
  title: "Mae Sot Connect",
  description: "Education and vocational resources in Mae Sot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

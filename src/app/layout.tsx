// src/app/layout.tsx
import React from "react";
import { Metadata } from "next";
import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JumpStudy.org",
    template: "%s | JumpStudy.org"
  },
  description: "Educational opportunities in Thailand",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

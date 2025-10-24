"use client";

import React, { useEffect, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    trackPageView(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light">
      <SessionProvider>
        <LanguageProvider>
          <ToastProvider>
            {/* WRAP children with Suspense and AnalyticsWrapper */}
            <Suspense fallback={null}>
              <AnalyticsWrapper>{children}</AnalyticsWrapper>
            </Suspense>
          </ToastProvider>
        </LanguageProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

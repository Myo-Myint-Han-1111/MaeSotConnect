"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. Your email is not authorized to access this application.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return errorMessages.Configuration;
      case "AccessDenied":
        return errorMessages.AccessDenied;
      case "Verification":
        return errorMessages.Verification;
      default:
        return errorMessages.Default;
    }
  };

  const isAccessDenied = error === "AccessDenied";

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center p-4 space-y-8">
      <div className="flex justify-center">
        <Image 
          src="/images/JumpStudyLogo.svg" 
          alt="JumpStudy.org" 
          width={200}
          height={64}
          className="h-16 w-auto"
        />
      </div>
      
      <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-600 dark:text-red-400">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isAccessDenied && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Access Restricted
                  </h3>
                  <p className="mt-2 text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    JumpStudy.org is currently in private beta. Only authorized administrators can access the system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild className="w-full" variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>
          
          {error && (
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                Error: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
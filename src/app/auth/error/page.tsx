"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isAccessDenied && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This application is currently in private beta. 
                Only authorized administrators can access the system.
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button asChild variant="default">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/">
                Go to Home
              </Link>
            </Button>
          </div>
          
          {error && (
            <div className="text-xs text-gray-500 text-center">
              Error code: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
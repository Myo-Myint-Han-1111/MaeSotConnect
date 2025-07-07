"use client";

import React, { useState } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState("");
  const { language } = useLanguage();
  
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    nextAuthSignIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Mae Sot Connect
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'mm' ? 'သင့်အကောင့်ကို အသုံးပြုရန် အကောင့်ဝင်ပါ' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {/* Google Sign In Button */}
          <Button
            className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            type="button"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            {language === 'mm' ? 'Google ဖြင့် အကောင့်ဝင်ရန်' : 'Sign in with Google'}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            {language === 'mm'
              ? 'Google အကောင့်ဖြင့်သာ အကောင့်ဝင်နိုင်မည်ဖြစ်သည်'
              : 'Only Google sign-in is supported'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
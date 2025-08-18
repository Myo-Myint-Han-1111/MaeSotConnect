"use client";

import React, { useState } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
        <CardHeader className="space-y-4 text-center">
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {language === 'mm' ? 'သင့်အကောင့်ကို အသုံးပြုရန် အကောင့်ဝင်ပါ' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <Button
            className="w-full bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3"></div>
                {language === 'mm' ? 'ကြိုးစားနေသည်...' : 'Signing in...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-3 h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {language === 'mm' ? 'Google ဖြင့် အကောင့်ဝင်ရန်' : 'Continue with Google'}
              </div>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {language === 'mm'
              ? 'Google အကောင့်ဖြင့်သာ အကောင့်ဝင်နိုင်မည်ဖြစ်သည်'
              : 'Secure authentication with Google'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
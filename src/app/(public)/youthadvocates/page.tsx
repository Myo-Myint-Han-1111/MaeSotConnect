"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFontSizeClasses } from "@/lib/font-sizes";

interface AdvocateProfile {
  id: string;
  publicName: string;
  bio?: string;
  avatarUrl?: string;
  showOrganization: boolean;
  organizationName?: string;
  courseCount: number;
}

export default function AdvocatesPage() {
  const { language } = useLanguage();
  const [profiles, setProfiles] = useState<AdvocateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const response = await fetch("/api/advocates/public");
        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
        } else {
          console.error("Failed to fetch profiles");
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 border-t-2 border-gray-400 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
       {/* High Score Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 mt-20">
        <div className="text-center">
          <h1 
            className={`${getFontSizeClasses("heading1", language)} font-bold text-gray-900 mb-4 text-4xl`}
            data-language={language}
          >
            {language === "mm" ? "🏆 လူငယ်ကိုယ်စားလှယ်များ" : "🏆 YOUTH ADVOCATES"}
          </h1>
          <div className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text font-bold text-lg mb-4">
            {language === "mm" ? "ထိပ်တန်းပေါင်းသူများ" : "TOP CONTRIBUTORS"}
          </div>
          <p 
            className={`${getFontSizeClasses("bodyRegular", language)} text-gray-600 max-w-2xl mx-auto`}
            data-language={language}
          >
            {language === "mm" 
              ? "ပညာရေးအခွင့်အလမ်းများ မျှဝေရန် ကူညီပေးသော ကျွန်ုပ်တို့၏ ကိုယ်စားလှယ်များ"
              : "People helping share educational opportunities"
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* High Score Leaderboard */}
        {profiles.length > 0 ? (
          <div>
            {/* Leaderboard Header - Responsive */}
            <div className="mb-6 md:mb-8 border-b-2 border-gray-300 pb-3 md:pb-4">
              {/* Desktop Headers - Match content layout structure */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="min-w-[60px] text-center">
                    <div className="text-gray-700 font-bold text-xl uppercase tracking-wider">
                      {language === "mm" ? "အဆင့်" : "RANK"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 flex-1">
                    <div className="w-24">
                      {/* Avatar space placeholder */}
                    </div>
                    <div className="flex items-center flex-1">
                      <div className="min-w-[160px]">
                        <div className="text-gray-700 font-bold text-xl uppercase tracking-wider">
                          {language === "mm" ? "ကစားသမား" : "PLAYER"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end ml-4">
                  <div className="text-gray-700 font-bold text-xl uppercase tracking-wider">
                    {language === "mm" ? "အပြေ့များ" : "STATS"}
                  </div>
                </div>
              </div>
              
              {/* Mobile Header - Single centered title */}
              <div className="md:hidden flex-1 text-center">
                <h2 className="text-gray-700 font-bold text-lg uppercase tracking-wide">
                  {language === "mm" ? "ကစားသမားများ" : "LEADERBOARD"}
                </h2>
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-6">
              {profiles.map((profile, index) => {
                const rank = index + 1;
                
                return (
                  <div 
                    key={profile.id}
                    className="rounded-xl md:p-4 py-4 pr-4 hover:bg-gray-50 transition-all duration-300 group border-b border-gray-200 last:border-b-0"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      {/* Rank */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="min-w-[60px] text-center flex items-center justify-center">
                          {rank <= 3 ? (
                            <div className="text-4xl">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                            </div>
                          ) : (
                            <div className="text-gray-500 font-bold text-3xl">
                              #{rank}
                            </div>
                          )}
                        </div>
                        
                        {/* Avatar, Name, and Bio */}
                        <div className="flex items-center space-x-8 flex-1">
                          <Avatar className="w-24 h-24 ring-2 ring-gray-200 group-hover:ring-gray-300 transition-all duration-200">
                            <AvatarImage 
                              src={profile.avatarUrl || undefined} 
                              alt={profile.publicName}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                              {profile.publicName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex items-center flex-1">
                            {/* Name and Organization */}
                            <div className="min-w-[160px]">
                              <h3 
                                className={`${getFontSizeClasses("heading3", language)} font-bold text-gray-900 mb-2`}
                                data-language={language}
                              >
                                {profile.publicName}
                              </h3>
                              {profile.showOrganization && profile.organizationName && (
                                <p 
                                  className={`${getFontSizeClasses("bodySmall", language)} text-gray-500`}
                                  data-language={language}
                                >
                                  {profile.organizationName}
                                </p>
                              )}
                            </div>
                            
                            {/* Bio */}
                            {profile.bio && (
                              <div className="flex-1 ml-6">
                                <p 
                                  className={`${getFontSizeClasses("bodyRegular", language)} text-gray-700 leading-relaxed`}
                                  data-language={language}
                                >
                                  {profile.bio}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex flex-col items-end ml-4">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold mb-2">
                          {language === "mm" ? `အပြေ့ ${profile.courseCount}` : `Score ${profile.courseCount}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === "mm" ? "ကူရစ် အများ" : "Courses Added"}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      {/* Mobile Player Info with Rank on Left */}
                      <div className="flex items-start">
                        {/* Rank Number */}
                        <div className="flex items-center justify-start flex-shrink-0 w-10">
                          {rank <= 3 ? (
                            <div className="text-4xl">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                            </div>
                          ) : (
                            <div className="text-gray-500 font-bold text-lg">
                              #{rank}
                            </div>
                          )}
                        </div>
                        
                        {/* Avatar */}
                        <Avatar className="w-14 h-14 ring-2 ring-gray-200 flex-shrink-0 ml-3">
                          <AvatarImage 
                            src={profile.avatarUrl || undefined} 
                            alt={profile.publicName}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base font-bold">
                            {profile.publicName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Player Details */}
                        <div className="flex-1 ml-3">
                          <h3 
                            className={`${getFontSizeClasses("heading3", language)} font-bold text-gray-900 mb-1`}
                            data-language={language}
                          >
                            {profile.publicName}
                          </h3>
                          {profile.showOrganization && profile.organizationName && (
                            <p 
                              className={`${getFontSizeClasses("bodySmall", language)} text-gray-500 mb-2`}
                              data-language={language}
                            >
                              {profile.organizationName}
                            </p>
                          )}
                          
                          {/* Mobile Bio */}
                          {profile.bio && (
                            <p 
                              className={`${getFontSizeClasses("bodyRegular", language)} text-gray-700 leading-relaxed mb-3`}
                              data-language={language}
                            >
                              {profile.bio}
                            </p>
                          )}
                          
                          {/* Mobile Stats */}
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                              {language === "mm" ? `အပြေ့ ${profile.courseCount}` : `Score ${profile.courseCount}`}
                            </div>
                            <span className="text-xs text-gray-500">
                              {language === "mm" ? "ကူရစ် အများ" : "Courses Added"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 
                className={`${getFontSizeClasses("heading3", language)} font-bold mb-4 text-gray-800`}
                data-language={language}
              >
                {language === "mm" ? "လူငယ်ကိုယ်စားလှယ်များမရှိသေးပါ" : "No Youth Advocates Yet"}
              </h3>
              <p 
                className={`${getFontSizeClasses("bodyRegular", language)} text-gray-600`}
                data-language={language}
              >
                {language === "mm" 
                  ? "လူငယ်ကိုယ်စားလှယ်များသည် မကြာမီတွင် ၎င်းတို့၏ပရိုဖိုင်းများကို ဖန်တီးပြီး မျှဝေကြမည်ဖြစ်ပါသည်။"
                  : "Youth advocates will create and share their profiles soon."
                }
              </p>
            </div>
          </div>
        )}

        {/* Simple call-to-action */}
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <h3 
            className={`${getFontSizeClasses("heading3", language)} font-bold mb-4 text-gray-800`}
            data-language={language}
          >
            {language === "mm" ? "လူငယ်ကိုယ်စားလှယ်ဖြစ်လိုပါသလား?" : "Want to Become a Youth Advocate?"}
          </h3>
          <p 
            className={`${getFontSizeClasses("bodyRegular", language)} text-gray-600`}
            data-language={language}
          >
            {language === "mm"
              ? "ပညာရေးအခွင့်အလမ်းများကို မျှဝေရန် ကူညီပေးလိုပါက ကျွန်ုပ်တို့နှင့် ဆက်သွယ်ပါ။"
              : "If you're interested in becoming a youth advocate, please contact us."
            }
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">
                  JumpStudy.org
                </span>
              </Link>
            </div>

            <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "ပင်မစာမျက်နှာ" : "Home"}
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "အကြောင်း" : "About Us"}
              </Link>
              <Link
                href="/youthadvocates"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm" ? "လူငယ်ကိုယ်စားလှယ်များ" : "Youth Advocates"}
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} JumpStudy.org. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Define available languages
export type Language = "en" | "mm";

// Define context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  changeLanguage: (language: Language) => void; // Alias for setLanguage for better readability
  t: (key: string) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  changeLanguage: () => {},
  t: () => "",
});

// Define props for provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Translations object
export const translations = {
  // English translations
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.language": "ENG | MM",

    // Home page
    "home.welcome": "What do you want to learn?",
    "home.subtitle":
      "Learn the skills. Find education programs that match your goals.",
    "home.search.placeholder": "Search courses by name or location",
    "home.filter.category": "Filter by category:",
    "home.filter.clear": "Clear all filters",
    "home.no.results": "No courses found",
    "home.no.results.desc":
      "Try different keywords or filters, or check back later for new courses.",
    "home.clear.search": "Clear All Filters",
    "home.courses.found": "courses found",
    "home.course.found": "course found", // For singular case

    // Course card
    "course.view.details": "View Details",
    "course.availability": "Availability",
    "course.seemore": "See More",
    "course.days.sun": "Sun",
    "course.days.mon": "Mon",
    "course.days.tue": "Tue",
    "course.days.wed": "Wed",
    "course.days.thu": "Thu",
    "course.days.fri": "Fri",
    "course.days.sat": "Sat",

    // Course info display short descriptions
    "course.info.starts": "Start Date",
    "course.info.duration": "Duration",
    "course.info.schedule": "Schedule",
    "course.info.fee": "Fee",
    "course.info.applyBy": "Application Deadline", // TODO: Ko Myo - For future use when applyByDate is added

    // Course detail
    "course.back": "Back",
    "course.details": "Course Details",
    "course.location": "Location",
    "course.startDate": "Start Date",
    "course.duration": "Duration",
    "course.schedule": "Schedule",
    "course.availableDays": "Available Days",
    "course.about": "About This Course",
    "course.outcomes": "Learning Outcomes",
    "course.detailedSchedule": "Detailed Schedule",
    "course.description": "Course Description",
    "course.learning.outcomes": "Learning Outcomes",
    "course.schedule.details": "Schedule Details",
    "course.selectionCriteria": "Selection Criteria",
    "course.howToApply": "How to Apply",
    "course.faq": "Frequently Asked Questions",
    "course.apply": "Apply Now",
    "course.fee": "Course Fee",
    "course.about.org": "About",
    "course.location.map": "Location",
    "course.facebook": "Visit our Facebook page",
    "course.notfound": "Course not found",
    "about.organization": "About Organization",
    "course.ageRange": "Age Range",
    "course.requiredDocuments": "Required Documents",
    "course.dates": "Dates",
    "course.estimatedDate": "Estimated Date",
    "course.info.estimated": "Estimated",

    // Specific course titles
    "course.thai.title": "Thai Language Course",
    "course.thai.subtitle": "Youth Learning Center",
    "course.sewing.title": "Sewing & Textile Design",
    "course.sewing.subtitle":
      "Develop skills for employment in garment industry",
    "course.computer.title": "Basic Computer Skills",
    "course.computer.subtitle":
      "Learn essential computer and office software skills",

    // Badge texts
    "badge.in-person": "In-person",
    "badge.online": "Online",
    "badge.free": "Free",
    "badge.internship": "Internship",
    "badge.certificate": "Certificate",
    "badge.vocational": "Vocational",
    "badge.cooking": "Cooking",
    "badge.barista training": "Barista Training",
    "badge.hospitality": "Hospitality",
    "badge.hair dressing": "Hair Dressing",
    "badge.fashion": "Fashion",
    "badge.technology": "Technology",
    "badge.computer skills": "Computer Skills",
    "badge.media": "Media",
    "badge.mental health": "Mental Health",
    "badge.sports": "Sports",
    "badge.art": "Art",
    "badge.music": "Music",
    "badge.martial art": "Martial Art",
    "badge.ged": "GED",
    "badge.ielts": "IELTS",
    "badge.thailand": "Thai",
    "badge.korea": "Korea",
    "badge.japan": "Japan",
    "badge.english": "English",

    // About page
    "about.title": "About Us",
    "about.mission.p1":
      "ThailandStudyGuide began as a simple idea to help solve an all-too common problem: many migrant and refugee youth feel stuck, unable to progress their education or begin a career. While Thailand has a wealth of education resources, the information is scattered across dozens of Facebook pages, Signal and WhatsApp groups, and is not easily searchable. Posts often exclude important information that allow youth to plan around a busy work schedule and personal commitments.",
    "about.mission.p2":
      "Ko Myo teamed up with Peter in 2025 to develop a web app that solves this problem by creating a centralized, user-friendly platform to search, filter, and compare vocational training programs, language courses, and skill development opportunities. It is being developed as an open source project and is currently self-funded. Our approach is to work with organizations that support youth to make the discovery process more accessible, transparent, and user-centered.",
    "about.komyo.title": "About Ko Myo",
    "about.komyo.content":
      "Ko Myo is a fullstack developer sharpening his skills through open-source projects that benefit Thai and Myanmar youth. He holds a bachelors in electrical engineering and is currently attending online classes in React, Javascript, and modern backend frameworks. He is passionate about education and technology and supporting digital literacy in rural communities.",

    "about.peter.title": "About Peter",
    "about.peter.content":
      "Peter is currently a graduate student in Boston supporting the development of ThailandStudyGuide part-time. He works to build bi-partisan constituencies that support education in conflict-affected settings. Peter worked in Mae Sot for several years, supporting local education organizations and teaching research and computer science part-time to youth.",

    "about.contact.title": "Contact",
    "about.contact.email": "contact@thailandstudyguide.com",
    "about.contact.description":
      "We're currently looking to partner with organizations and individuals who share our mission of supporting migrant and refugee youth education in Thailand. If you have feedback about the app, or would like to collaborate, please don't hesitate to send us an email.",

    // Add these sort translations:
    "sort.default": "Newest First",
    "sort.placeholder": "Sort by",
    "sort.startDate.earliest": "Starting Soon",
    "sort.startDate.latest": "Starting Later",
    "sort.applyByDate.earliest": "Apply Soon",
    "sort.applyByDate.latest": "Apply Later",
  },

  // Myanmar translations
  mm: {
    // Navbar
    "nav.home": "ပင်မစာမျက်နှာ",
    "nav.about": "ကျွန်ုပ်တို့အကြောင်း",
    "nav.language": "အင်္ဂလိပ် | မြန်မာ",

    // Home page
    "home.welcome": "သင် ဘာသင်ယူချင်ပါသလဲ။",
    "home.subtitle":
      "အတတ်ပညာကိုသင်ယူလေ့လာပါ။ သင့်ရည်မှန်းချက်နှင့် ကိုက်ညီသော သင်တန်းများနှင့် ပညာရေးအစီအစဉ်များကို ရှာဖွေပါ။",
    "home.search.placeholder": "သင်တန်းအမည် သို့မဟုတ် တည်နေရာ ရှာဖွေပါ...",
    "home.filter.category": "အမျိုးအစားဖြင့် စစ်ထုတ်ရန်:",
    "home.filter.clear": "ပြန်လည်စတင်ရန်",
    "home.no.results": "သင်တန်းများ မတွေ့ရှိပါ",
    "home.no.results.desc":
      "အခြားစကားလုံးများဖြင့် ထပ်မံကြိုးစားကြည့်ပါ သို့မဟုတ် သင်တန်းအသစ်များအတွက် နောက်တစ်ကြိမ် စစ်ဆေးပါ။",
    "home.clear.search": "ရှာဖွေမှုများအားလုံး ရှင်းလင်းရန်",
    "home.courses.found": "သင်တန်းများ {count} ခုတွေ့ရှိသည်",
    "home.course.found": "သင်တန်း {count} ခုတွေ့ရှိသည်",

    // Course card
    "course.view.details": "အသေးစိတ်ကြည့်ရန်",
    "course.availability": "တက်ရောက်နိုင်သောရက်များ",
    "course.seemore": "အသေးစိတ်ကြည့်ရန်",
    // "course.days.sun": "တနင်္ဂနွေ",
    // "course.days.mon": "တနင်္လာ",
    // "course.days.tue": "အင်္ဂါ",
    // "course.days.wed": "ဗုဒ္ဓဟူး",
    // "course.days.thu": "ကြာသပတေး",
    // "course.days.fri": "သောကြာ",
    // "course.days.sat": "စနေ",

    // Course info display short descriptions
    "course.info.starts": "စတင်သည့်ရက်",
    "course.info.duration": "ကြာချိန်",
    "course.info.schedule": "အချိန်ဇယား",
    "course.info.fee": "သင်တန်းကြေး",
    "course.info.applyBy": "နောက်ဆုံးလျှောက်ရမည့်ရက်",

    "course.address": "သင်တန်းလိပ်စာ",

    // Course detail
    "course.back": "ပြန်သွားရန်",
    "course.details": "သင်တန်းအသေးစိတ်",
    "course.description": "သင်တန်းဖော်ပြချက်",
    "course.learning.outcomes": "လေ့လာသင်ယူမှုရလဒ်များ",
    "course.schedule.details": "အချိန်ဇယားအသေးစိတ်",
    "course.location": "တည်နေရာ",
    "course.startDate": "စတင်မည့်ရက်စွဲ",
    "course.duration": "ကြာချိန်",
    "course.schedule": "အချိန်ဇယား",
    "course.availableDays": "တက်ရောက်နိုင်သောရက်များ",
    "course.about": "ဤသင်တန်းအကြောင်း",
    "course.outcomes": "လေ့လာသင်ယူမှုရလဒ်များ",
    "course.detailedSchedule": "အသေးစိတ်အချိန်ဇယား",
    "course.selectionCriteria": "ရွေးချယ်ရေးစံနှုန်းများ",
    "course.howToApply": "လျှောက်ထားပုံ",
    "course.faq": "မေးလေ့ရှိသောမေးခွန်းများ",
    "course.apply": "လျှောက်ထားရန်",
    "course.fee": "သင်တန်းကြေး",
    "course.about.org": "အကြောင်း",
    "course.location.map": "တည်နေရာ",
    "course.facebook": "ကျွန်ုပ်တို့၏ Facebook စာမျက်နှာကို ကြည့်ရှုပါ",
    "course.notfound": "သင်တန်းကို ရှာမတွေ့ပါ",
    "about.organization": "အဖွဲ့အကြောင်း",
    "course.ageRange": "အသက်အရွယ်",
    "course.requiredDocuments": "လိုအပ်သော စာရွက်စာတမ်းများ",
    "course.dates": "ရက်စွဲများ",
    "course.estimatedDate": "ခန့်မှန်းရက်စွဲ",
    "course.info.estimated": "ခန့်မှန်း",

    // Specific course titles
    "course.thai.title": "ထိုင်းဘာသာစကားသင်တန်း",
    "course.thai.subtitle": "လူငယ်သင်ယူရေးစင်တာ",
    "course.sewing.title": "အထည်ချုပ်နှင့် အထည်ဒီဇိုင်း",
    "course.sewing.subtitle":
      "အထည်ချုပ်လုပ်ငန်းအတွက် ကျွမ်းကျင်မှုများကို လေ့လာရန်",
    "course.computer.title": "အခြေခံကွန်ပျူတာအသုံးပြုမှု",
    "course.computer.subtitle":
      "အရေးကြီးသော ကွန်ပျူတာနှင့် ရုံးသုံးဆော့ဖ်ဝဲကျွမ်းကျင်မှုများ သင်ယူရန်",

    // Badge texts
    "badge.in-person": "သင်တန်းခန်းမ",
    "badge.online": "အွန်လိုင်း",
    "badge.free": "အခမဲ့",
    "badge.internship": "အလုပ်သင်",
    "badge.certificate": "လက်မှတ်",
    "badge.vocational": "အသက်မွေးပညာ",
    "badge.cooking": "ချက်ပြုတ်ခြင်း",
    "badge.barista training": "ကော်ဖီပြုလုပ်ခြင်း",
    "badge.hospitality": "ဧည့်ခံမှု",
    "badge.hair dressing": "ဆံပင်ညှပ်ခြင်း",
    "badge.fashion": "ဖက်ရှင်",
    "badge.technology": "နည်းပညာ",
    "badge.computer skills": "ကွန်ပျူတာစွမ်းရည်",
    "badge.media": "မီဒီယာ",
    "badge.mental health": "စိတ်ကျန်းမာရေး",
    "badge.sports": "အားကစား",
    "badge.art": "အနုပညာ",
    "badge.music": "ဂီတ",
    "badge.martial art": "ကိုယ်ခံပညာ",
    "badge.ged": "GED",
    "badge.ielts": "IELTS",
    "badge.thailand": "ထိုင်းဘာသာစကား",
    "badge.korea": "ကိုရီးယား",
    "badge.japan": "ဂျပန်",
    "badge.english": "အင်္ဂလိပ်ဘာသာစကား",

    // About page
    "about.title": "ကျွန်ုပ်တို့အကြောင်း",
    "about.subtitle": "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်နှင့် အဖွဲ့အကြောင်း လေ့လာပါ",
    "about.mission.title": "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်",
    "about.mission.p1":
      "ယခုဝက်ဆိုဒ်သည် ပညာရေးအခွင့်အလမ်းများကို လွယ်ကူထိရောက်စွာ ရှာဖွေရယူနိုင်သော အချိန်သက်သာသည့် စနစ်တစ်ခုပေးအပ်ခြင်းဖြင့် လူငယ်များကို စွမ်းဆောင်ရည်မြှင့်တင်ပေးပါသည်။ ကျွန်ုပ်တို့သည် သင်ယူရရှိနိုင်သော သင်တန်းအချက်အလက်များအား တစ်နေရာတည်းတွင် ဖော်ပြသော၊ အသုံးပြုရလွယ်ကူသည့် အက်ပလီကေးရှင်းတစ်ခုဖန်တီးခြင်းဖြင့် လူငယ်များအား ၎င်းတို့၏ အသက်မွေးဝမ်းကြောင်းရည်မှန်းချက်များနှင့် အချိန်ဇယားများနှင့်ကိုက်ညီသော အသက်မွေးပညာလေ့ကျင့်ရေးအစီအစဉ်များ၊ ဘာသာစကားသင်တန်းများနှင့် ကျွမ်းကျင်မှုတိုးတက်ရေးအခွင့်အလမ်းများကို လွယ်ကူစွာ နှိုင်းယှဉ်၊  စစ်ထုတ်၊ ရှာဖွေ နိုင်စေပါသည်။",

    "about.komyo.title": "Ko Myo အကြောင်း",
    "about.komyo.content":
      "Ko Myo သည် ထိုင်းနှင့် မြန်မာလူငယ်များအတွက် အကျိုးပြုသော open-source projects များမှတစ်ဆင့် ကျွမ်းကျင်မှုများကို တိုးတက်စေနေသော fullstack developer တစ်ဦးဖြစ်သည်။ သူသည် လျှပ်စစ်အင်ဂျင်နီယာဘွဲ့ရရှိထားပြီး လောလောဆယ် React၊ Javascript နှင့် ခေတ်မီ backend frameworks များကို အွန်လိုင်း class များတက်နေပါသည်။ သူသည် ပညာရေးနှင့် နည်းပညာကို စိတ်ရောက်ရောက် ခံယူထားပြီး ကျေးလက်ရှိ လူမှုအသိုင်းအဝိုင်းများတွင် ဒီဂျစ်တယ်ပညာရေးကို ထောက်ပံ့နေပါသည်။",

    "about.peter.title": "Peter အကြောင်း",
    "about.peter.content":
      "Peter သည် လောလောဆယ် Boston တွင် ဘွဲ့လွန်ကျောင်းသားတစ်ဦးဖြစ်ပြီး ThailandStudyGuide ၏ တိုးတက်မှုကို အချိန်ပိုင်းအားဖြင့် ပံ့ပိုးနေပါသည်။ သူသည် ပဋိပက္ခကျရောက်သော နေရာများတွင် လူငယ်ပညာရေးကို ထောက်ပံ့သည့် နှစ်ဖက်စလုံးပူးပေါင်း အုပ်စုများကို တည်ဆောက်ရန် ကြိုးပမ်းနေပါသည်။ Peter သည် Mae Sot တွင် နှစ်ပေါင်းများစွာ လုပ်ဆောင်ခဲ့ပြီး ပြည်သူ့ပညာရေးအဖွဲ့အစည်းများကို ပံ့ပိုးခဲ့သည်အပြင် လူငယ်များအား သုတေသနနှင့် computer science ကို အချိန်ပိုင်းဆရာအဖြစ် သင်ကြားပေးခဲ့ပါသည်။",

    "about.contact.title": "ဆက်သွယ်ရန်",
    "about.contact.email": "contact@thailandstudyguide.com",
    "about.contact.description":
      "ကျွန်ုပ်တို့သည် လောလောဆယ် ထိုင်းနိုင်ငံမှ လူငယ်ပညာရေးကို ပံ့ပိုးရန် ကျွန်ုပ်တို့၏ ရည်မှန်းချက်နှင့် သဘောထားတူသော အဖွဲ့အစည်းများနှင့် တစ်ဦးချင်းပုဂ္ဂိုလ်များကို ရှာဖွေနေပါသည်။ အကယ်၍ သင်တွင် app နှင့် ပတ်သတ်သော အကြံပြုချက်များရှိပါက သို့မဟုတ် ပူးပေါင်းဆောင်ရွက်လိုပါက ကျွန်ုပ်တို့ထံ email ပို့ရန် မဝန်လျတ် ပါ။",
    "about.team.title": "ကျွန်ုပ်တို့၏အဖွဲ့နှင့် တွေ့ဆုံပါ",

    // Add these sort translations:
    "sort.default": "အသစ်ဆုံးကို ဦးစွာ",
    "sort.placeholder": "အစီအစဉ်ခွဲ",
    "sort.startDate.earliest": "မကြာမီစတင်မည်",
    "sort.startDate.latest": "နောက်ပိုင်းစတင်မည်",
    "sort.applyByDate.earliest": "မကြာမီလျှောက်ပါ",
    "sort.applyByDate.latest": "နောက်ပိုင်းလျှောက်ပါ",
  },
};

// Create provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Get initial language from localStorage or default to English
  const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language");
      return savedLanguage === "en" || savedLanguage === "mm"
        ? (savedLanguage as Language)
        : "en";
    }
    return "en"; // Default for server-side rendering
  };

  // Start with default "en" for SSR
  const [language, setLanguageState] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Update language after component mounts (client-side only)
  useEffect(() => {
    setLanguageState(getInitialLanguage());
    setIsHydrated(true);
  }, []);

  // Set language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

  // Translation function
  const t = (key: string): string => {
    // Get the current language translations
    const languageTranslations = translations[language];

    // Check if the key exists in the current language translations
    if (key in languageTranslations) {
      return languageTranslations[key as keyof typeof languageTranslations];
    }

    // Fallback to English if the key doesn't exist in the current language
    if (language !== "en" && key in translations.en) {
      return translations.en[key as keyof typeof translations.en];
    }

    // Return the key itself as a last resort
    return key;
  };

  const contextValue = {
    language,
    setLanguage,
    changeLanguage: setLanguage, // Alias for better readability
    t,
  };

  // Don't render children until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// The LanguageContext.tsx file provides a multilingual system for the Mae Sot Connect application with these key features:

// 1. **Language Management**:
//    - Supports English and Myanmar languages
//    - Stores language preference in localStorage
//    - Provides functions to change languages

// 2. **Translation System**:
//    - Contains comprehensive translation dictionaries for both languages
//    - Includes translations for navigation, course details, badges, and pages
//    - Offers a fallback mechanism if translations are missing

// 3. **Context API Implementation**:
//    - Creates a React Context to share language data throughout the app
//    - Provides a `t()` function to translate text keys into the current language
//    - Makes translations accessible via a custom `useLanguage()` hook

// 4. **User Experience Features**:
//    - Maintains consistent terminology across the application
//    - Handles singular/plural forms appropriately
//    - Includes specialized Myanmar translations that respect cultural context

// This file enables the entire application to switch seamlessly between languages, creating an inclusive experience for both English and Myanmar-speaking users.

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
    "nav.contact": "Contact Us",
    "nav.language": "ENG | MM",

    // Home page
    "home.welcome": "What do you want to learn?",
    "home.subtitle": "Learn the skills. Create your path.",
    "home.search.placeholder":
      "Search courses by name, location, or category...",
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
    "course.info.starts": "Starts",
    "course.info.duration": "Duration",
    "course.info.schedule": "Schedule",
    "course.info.fee": "Fee",
    "course.info.applyBy": "Apply by", // TODO: Ko Myo - For future use when applyByDate is added

    // Future full labels (for non-compact mode)
    "course.applyBy": "Apply By", // TODO: Ko Myo - For future use when applyByDate is added

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
    "course.faq": "Frequently Asked Questions",
    "course.apply": "Apply Now",
    "course.fee": "Course Fee",
    "course.about.org": "About",
    "course.location.map": "Location",
    "course.notfound": "Course not found",
    "about.organization": "About Organization",
    "course.ageRange": "Age Range",
    "course.requiredDocuments": "Required Documents",
    "course.dates": "Dates",

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
    "badge.language": "Language",
    "badge.inperson": "In-Person",
    "badge.free": "Free",
    "badge.vocational": "Vocational",
    "badge.internship": "Internship",
    "badge.technology": "Technology",
    "badge.beginner": "Beginner",

    // About page
    "about.title": "About Us",
    "about.subtitle": "Learn about our mission and our team",
    "about.mission.title": "Our Mission",
    "about.mission.p1":
      "At Mae Sot Connect, we're dedicated to delivering exceptional products and services that empower our clients to achieve their goals. We believe in innovation, integrity, and creating lasting relationships with everyone we work with.",
    "about.mission.p2":
      "Founded with a clear vision of connecting businesses and communities, we've grown steadily while maintaining our commitment to personalized service and attention to detail.",
    "about.team.title": "Meet Our Team",
    "about.contact.title": "Get in Touch",
    "about.contact.text":
      "Interested in learning more about our company or services? We'd love to hear from you!",
    "about.contact.button": "Contact Us",

    // Contact page
    "contact.title": "Contact Us",
    "contact.subtitle": "We'd love to hear from you",
    "contact.phone.title": "Phone",
    "contact.phone.text": "Call us during business hours",
    "contact.email.title": "Email",
    "contact.email.text": "We'll respond as soon as possible",
    "contact.facebook.title": "Facebook",
    "contact.facebook.text": "Follow us for updates",
    "contact.location.title": "Our Location",
    "course.facebook": "Visit our Facebook page",
    "contact.location.maptext": "Map of our location in Mae Sot",
  },

  // Myanmar translations
  mm: {
    // Navbar
    "nav.home": "ပင်မစာမျက်နှာ",
    "nav.about": "ကျွန်ုပ်တို့အကြောင်း",
    "nav.contact": "ဆက်သွယ်ရန်",
    "nav.language": "အင်္ဂလိပ် | မြန်မာ",

    // Home page
    "home.welcome": "မင်းဘာသင်ချင်လဲ",
    "home.subtitle": "အတက်ပညာကိုသင်ယူလေ့လာပါ။ သင်လမ်းကြောင်းကိုဖန်တီးပါ။",
    "home.search.placeholder":
      "သင်တန်းအမည်၊ တည်နေရာ သို့မဟုတ် အမျိုးအစားဖြင့် ရှာဖွေပါ...",
    "home.filter.category": "အမျိုးအစားဖြင့် စစ်ထုတ်ရန်:",
    "home.filter.clear": "ပြန်လည်စတင်ရန်",
    "home.no.results": "သင်တန်းများ မတွေ့ရှိပါ",
    "home.no.results.desc":
      "အခြားစကားလုံးများဖြင့် ထပ်မံကြိုးစားကြည့်ပါ သို့မဟုတ် သင်တန်းအသစ်များအတွက် နောက်တစ်ကြိမ် စစ်ဆေးပါ။",
    "home.clear.search": "ရှာဖွေမှုများအားလုံး ရှင်းလင်းရန်",
    "home.courses.found": "သင်တန်းများတွေ့ရှိသည်",
    "home.course.found": "သင်တန်းတွေ့ရှိသည်", // For singular case

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
    "course.info.applyBy": "လျှောက်ထားရမည့်", // TODO: Ko Myo - For future use when applyByDate is added

    // Future full labels (for non-compact mode)
    "course.applyBy": "လျှောက်ထားရမည့်ရက်", // TODO: Ko Myo - For future use when applyByDate is added

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
    "badge.language": "ဘာသာစကား",
    "badge.inperson": "သင်တန်းခန်းမ",
    "badge.free": "အခမဲ့",
    "badge.vocational": "အသက်မွေးပညာ",
    "badge.internship": "အလုပ်သင်",
    "badge.technology": "နည်းပညာ",
    "badge.beginner": "အခြေခံ",

    // About page
    "about.title": "ကျွန်ုပ်တို့အကြောင်း",
    "about.subtitle": "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်နှင့် အဖွဲ့အကြောင်း လေ့လာပါ",
    "about.mission.title": "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်",
    "about.mission.p1":
      "မဲဆောက်ကွန်နက်တွင် ကျွန်ုပ်တို့သည် ကျွန်ုပ်တို့၏ ဖောက်သည်များအား ၎င်းတို့၏ ရည်မှန်းချက်များကို ရရှိရန် စွမ်းဆောင်ရည် မြှင့်တင်ပေးသည့် ထူးခြားသော ထုတ်ကုန်များနှင့် ဝန်ဆောင်မှုများ ပေးအပ်ရန် အာရုံစိုက်ထားပါသည်။",
    "about.mission.p2":
      "စီးပွားရေးလုပ်ငန်းများနှင့် အသိုင်းအဝိုင်းများကို ချိတ်ဆက်ပေးရန် ရှင်းလင်းသော ရူပါရုံဖြင့် တည်ထောင်ခဲ့ပြီး၊ ကျွန်ုပ်တို့သည် တစ်ဦးချင်းအလိုက် ဝန်ဆောင်မှုနှင့် အသေးစိတ်အချက်များကို အာရုံစိုက်ခြင်းအပေါ် ကတိကဝတ်ကို ထိန်းသိမ်းထားပါသည်။",
    "about.team.title": "ကျွန်ုပ်တို့၏အဖွဲ့နှင့် တွေ့ဆုံပါ",
    "about.contact.title": "ဆက်သွယ်ရန်",
    "about.contact.text":
      "ကျွန်ုပ်တို့ကုမ္ပဏီ သို့မဟုတ် ဝန်ဆောင်မှုများအကြောင်း ပိုမိုလေ့လာလိုပါသလား။ သင့်ထံမှ ကြားလိုပါသည်!",
    "about.contact.button": "ဆက်သွယ်ရန်",

    // Contact page
    "contact.title": "ဆက်သွယ်ရန်",
    "contact.subtitle": "သင့်ထံမှ ကြားလိုပါသည်",
    "contact.phone.title": "ဖုန်း",
    "contact.phone.text": "လုပ်ငန်းချိန်အတွင်း ဖုန်းခေါ်ဆိုပါ",
    "contact.email.title": "အီးမေးလ်",
    "contact.email.text":
      "ကျွန်ုပ်တို့ တတ်နိုင်သမျှ မြန်ဆန်စွာ ပြန်ကြားပေးပါမည်",
    "contact.facebook.title": "ဖေ့စ်ဘွတ်ခ်",
    "contact.facebook.text": "နောက်ဆုံးရ အချက်အလက်များအတွက် Follow လုပ်ပါ",
    "contact.location.title": "ကျွန်ုပ်တို့၏တည်နေရာ",
    "contact.location.maptext": "မဲဆောက်မြို့ရှိ ကျွန်ုပ်တို့တည်နေရာ မြေပုံ",
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

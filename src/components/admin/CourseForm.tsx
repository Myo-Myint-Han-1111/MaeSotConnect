// src/components/admin/CourseForm.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSelector from "@/components/admin/LocationSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  Upload,
  Clock,
  BookOpen,
  FileText,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";

interface CourseFormData {
  id?: string;
  title: string;
  titleMm: string;
  subtitle: string;
  subtitleMm: string;
  province: string;
  district: string;
  address: string;
  applyByDate: string;
  applyByDateMm: string;
  startDate: string;
  endDate: string;
  duration: number;
  schedule: string;
  scheduleMm: string;
  feeAmount: number;
  ageMin?: number | null;
  ageMax?: number | null;
  document: string;
  documentMm: string;
  availableDays: boolean[];
  description: string;
  descriptionMm: string;
  outcomes: string[];
  outcomesMm: string[];
  scheduleDetails: string;
  scheduleDetailsMm: string;
  selectionCriteria: string[];
  selectionCriteriaMm: string[];
  howToApply: string[];
  howToApplyMm: string[];
  applyButtonText?: string;
  applyButtonTextMm?: string;
  applyLink?: string;
  estimatedDate: string;
  estimatedDateMm: string;
  // UI-only fields for checkbox state
  showEstimatedForStartDate: boolean;
  showEstimatedForApplyByDate: boolean;
  organizationId?: string;
  images: File[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  faq: {
    question: string;
    questionMm: string;
    answer: string;
    answerMm: string;
  }[];
}

interface Organization {
  id: string;
  name: string;
}

interface BadgeOption {
  text: string;
  color: string;
  backgroundColor: string;
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  mode: "create" | "edit";
  organizationId?: string;
  existingImages?: string[];
}

const badgeOptions: BadgeOption[] = [
  { text: "In-person", color: "#fff", backgroundColor: "#28a745" }, // Green
  { text: "Online", color: "#fff", backgroundColor: "#007bff" }, // Blue
  { text: "Free", color: "#fff", backgroundColor: "#dc3545" }, // Red
  { text: "Internship", color: "#fff", backgroundColor: "#fd7e14" }, // Orange
  { text: "Certificate", color: "#fff", backgroundColor: "#17a2b8" }, // Cyan
  { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" }, // Purple
  { text: "Cooking", color: "#fff", backgroundColor: "#e83e8c" }, // Pink
  { text: "Barista Training", color: "#fff", backgroundColor: "#6f4e37" }, // Brown
  { text: "Hospitality", color: "#fff", backgroundColor: "#20c997" }, // Teal
  { text: "Hair Dressing", color: "#fff", backgroundColor: "#f8c2d4" }, // Light Pink
  { text: "Fashion", color: "#fff", backgroundColor: "#e91e63" }, // Deep Pink
  { text: "Technology", color: "#fff", backgroundColor: "#6c757d" }, // Gray (changed from blue)
  { text: "Computer Skills", color: "#fff", backgroundColor: "#343a40" }, // Dark Gray
  { text: "Media", color: "#fff", backgroundColor: "#9c27b0" }, // Deep Purple
  { text: "Mental Health", color: "#fff", backgroundColor: "#4caf50" }, // Light Green
  { text: "Sports", color: "#fff", backgroundColor: "#ff5722" }, // Deep Orange
  { text: "Art", color: "#fff", backgroundColor: "#3f51b5" }, // Indigo
  { text: "Music", color: "#fff", backgroundColor: "#795548" }, // Brown Gray
  { text: "Martial Art", color: "#fff", backgroundColor: "#607d8b" }, // Blue Gray
  { text: "GED", color: "#fff", backgroundColor: "#ff9800" }, // Amber
  { text: "IELTS", color: "#fff", backgroundColor: "#2196f3" }, // Light Blue
  { text: "Thai", color: "#fff", backgroundColor: "#ff6b35" }, // Coral
  { text: "Korea", color: "#fff", backgroundColor: "#4ecdc4" }, // Turquoise
  { text: "Japan", color: "#fff", backgroundColor: "#e74c3c" }, // Crimson
  { text: "English", color: "#fff", backgroundColor: "#2c3e50" }, // Dark Blue
  {
    text: "Pre-university",
    color: "#fff",
    backgroundColor: "#1976d2", // Royal Blue
  },
  {
    text: "Pre-career",
    color: "#fff",
    backgroundColor: "#388e3c", // Forest Green
  },
  { text: "Chess", color: "#fff", backgroundColor: "#8b4513" },
];

// Helper function to decode estimated date and preferences when loading existing data
const parseExistingEstimatedDate = (
  estimatedDateString: string | null | undefined
) => {
  console.log("Parsing estimated date string:", estimatedDateString);

  if (!estimatedDateString || estimatedDateString === "") {
    return {
      estimatedDate: "",
      showEstimatedForStartDate: false,
      showEstimatedForApplyByDate: false,
    };
  }

  // Check if the string contains our encoding (text|startFlag|applyFlag)
  const parts = estimatedDateString.split("|");
  if (parts.length === 3) {
    const result = {
      estimatedDate: parts[0],
      showEstimatedForStartDate: parts[1] === "1",
      showEstimatedForApplyByDate: parts[2] === "1",
    };
    console.log("Decoded result:", result);
    return result;
  }

  // If no encoding found, it's old data - default to showing for both (backward compatibility)
  const result = {
    estimatedDate: estimatedDateString,
    showEstimatedForStartDate: true,
    showEstimatedForApplyByDate: true,
  };
  console.log("Old format detected, using defaults:", result);
  return result;
};

export default function CourseForm({
  initialData,
  mode,
  organizationId,
  existingImages = [],
}: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isMobile, setIsMobile] = useState(false);
  const [existingImageList, setExistingImageList] =
    useState<string[]>(existingImages);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Initialize form data with default values
  const [formData, setFormData] = useState<CourseFormData>(() => {
    // Don't parse estimated dates here - wait for initialData to be stable
    return {
      title: "",
      titleMm: "",
      subtitle: "",
      subtitleMm: "",
      province: "",
      district: "",
      address: "",
      applyByDate: "",
      applyByDateMm: "",
      startDate: "",
      endDate: "",
      duration: 0,
      schedule: "",
      scheduleMm: "",
      feeAmount: 0,
      ageMin: null,
      ageMax: null,
      document: "",
      documentMm: "",
      availableDays: [false, false, false, false, false, false, false],
      description: "",
      descriptionMm: "",
      outcomes: [""],
      outcomesMm: [""],
      scheduleDetails: "",
      scheduleDetailsMm: "",
      selectionCriteria: [""],
      selectionCriteriaMm: [""],
      organizationId: organizationId ?? "",
      howToApply: [""],
      howToApplyMm: [""],
      applyButtonText: "",
      applyButtonTextMm: "",
      applyLink: "",
      estimatedDate: "",
      estimatedDateMm: "",
      showEstimatedForStartDate: false,
      showEstimatedForApplyByDate: false,
      images: [],
      badges: [],
      faq: [{ question: "", questionMm: "", answer: "", answerMm: "" }],
    };
  });

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Add this useEffect to debug the form data
  useEffect(() => {
    console.log(
      "Current form data - Province:",
      formData.province,
      "District:",
      formData.district
    );
  }, [formData.province, formData.district]);

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        } else {
          console.error("Failed to fetch organizations");
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (existingImages.length > 0) {
      setExistingImageList(existingImages);
    }
  }, [existingImages]);

  useEffect(() => {
    if (initialData) {
      console.log("=== CourseForm: Syncing with initialData ===");
      console.log("Mode:", mode);
      console.log("InitialData:", initialData);
      console.log("Raw estimatedDate:", initialData.estimatedDate);
      console.log("Raw estimatedDateMm:", initialData.estimatedDateMm);

      // Parse existing estimated date data
      const estimatedPrefs = parseExistingEstimatedDate(
        initialData.estimatedDate
      );
      const estimatedPrefsMm = parseExistingEstimatedDate(
        initialData.estimatedDateMm
      );

      console.log("Parsed English prefs:", estimatedPrefs);
      console.log("Parsed Myanmar prefs:", estimatedPrefsMm);

      // Use the same checkbox preferences for both languages
      const showStart =
        estimatedPrefs.showEstimatedForStartDate ||
        estimatedPrefsMm.showEstimatedForStartDate;
      const showApply =
        estimatedPrefs.showEstimatedForApplyByDate ||
        estimatedPrefsMm.showEstimatedForApplyByDate;

      setFormData({
        title: initialData.title ?? "",
        titleMm: initialData.titleMm ?? "",
        subtitle: initialData.subtitle ?? "",
        subtitleMm: initialData.subtitleMm ?? "",
        province: initialData.province ?? "",
        district: initialData.district ?? "",
        address: initialData.address ?? "",
        applyByDate: initialData.applyByDate ?? "",
        applyByDateMm: initialData.applyByDateMm ?? "",
        startDate: initialData.startDate ?? "",
        endDate: initialData.endDate ?? "",
        duration: initialData.duration ?? 0,
        schedule: initialData.schedule ?? "",
        scheduleMm: initialData.scheduleMm ?? "",
        feeAmount: initialData.feeAmount ?? 0,
        ageMin:
          initialData.ageMin && initialData.ageMin > 0
            ? initialData.ageMin
            : null,
        ageMax:
          initialData.ageMax && initialData.ageMax > 0
            ? initialData.ageMax
            : null,
        document: initialData.document ?? "",
        documentMm: initialData.documentMm ?? "",
        availableDays: initialData.availableDays ?? [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        description: initialData.description ?? "",
        descriptionMm: initialData.descriptionMm ?? "",
        outcomes: initialData.outcomes?.length ? initialData.outcomes : [""],
        outcomesMm: initialData.outcomesMm?.length
          ? initialData.outcomesMm
          : [""],
        scheduleDetails: initialData.scheduleDetails ?? "",
        scheduleDetailsMm: initialData.scheduleDetailsMm ?? "",
        selectionCriteria: initialData.selectionCriteria?.length
          ? initialData.selectionCriteria
          : [""],
        selectionCriteriaMm: initialData.selectionCriteriaMm?.length
          ? initialData.selectionCriteriaMm
          : [""],
        howToApply: initialData.howToApply?.length
          ? initialData.howToApply
          : [""],
        howToApplyMm: initialData.howToApplyMm?.length
          ? initialData.howToApplyMm
          : [""],
        applyButtonText: initialData.applyButtonText ?? "",
        applyButtonTextMm: initialData.applyButtonTextMm ?? "",
        applyLink: initialData.applyLink ?? "",
        // Set the decoded estimated date values
        estimatedDate: estimatedPrefs.estimatedDate,
        estimatedDateMm: estimatedPrefsMm.estimatedDate,
        showEstimatedForStartDate: showStart,
        showEstimatedForApplyByDate: showApply,
        organizationId:
          initialData.organizationId ||
          organizationId ||
          (organizations.length > 0 ? organizations[0].id : ""),
        images: [],
        badges: initialData.badges ?? [],
        faq: initialData.faq?.length
          ? initialData.faq
          : [{ question: "", questionMm: "", answer: "", answerMm: "" }],
      });

      console.log("=== Form data updated with estimated dates ===");
      console.log("estimatedDate set to:", estimatedPrefs.estimatedDate);
      console.log("estimatedDateMm set to:", estimatedPrefsMm.estimatedDate);
      console.log("showEstimatedForStartDate set to:", showStart);
      console.log("showEstimatedForApplyByDate set to:", showApply);
    }
  }, [initialData, organizationId, mode, organizations]);

  // Debug effect to monitor form data changes
  useEffect(() => {
    if (mode === "edit") {
      console.log("=== Form Data State Changed ===");
      console.log("estimatedDate:", formData.estimatedDate);
      console.log("estimatedDateMm:", formData.estimatedDateMm);
      console.log(
        "showEstimatedForStartDate:",
        formData.showEstimatedForStartDate
      );
      console.log(
        "showEstimatedForApplyByDate:",
        formData.showEstimatedForApplyByDate
      );
    }
  }, [
    formData.estimatedDate,
    formData.estimatedDateMm,
    formData.showEstimatedForStartDate,
    formData.showEstimatedForApplyByDate,
    mode,
  ]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const inputValue = e.target.value;

    // Special handling for age fields to prevent auto-fill
    if (fieldName === "ageMin" || fieldName === "ageMax") {
      console.log(`Age field ${fieldName} input:`, inputValue); // Debug log

      // If the input is completely empty, set to null (no auto-fill)
      if (
        inputValue === "" ||
        inputValue === null ||
        inputValue === undefined
      ) {
        console.log(`Setting ${fieldName} to null`); // Debug log
        setFormData((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
        return;
      }

      // Parse the input value
      const numericValue = parseInt(inputValue, 10);

      // Only set the value if it's a valid positive number
      if (!isNaN(numericValue) && numericValue > 0) {
        console.log(`Setting ${fieldName} to:`, numericValue); // Debug log
        setFormData((prev) => ({
          ...prev,
          [fieldName]: numericValue,
        }));
      } else {
        // For invalid values (0, negative, or NaN), set to null
        console.log(`Invalid value for ${fieldName}, setting to null`); // Debug log
        setFormData((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
      }
    } else {
      // Handle other numeric fields normally (duration, feeAmount, etc.)
      const value = inputValue === "" ? 0 : parseInt(inputValue, 10) || 0;
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  // Add this new handler for checkbox changes
  const handleCheckboxChange = (fieldName: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName as keyof CourseFormData],
    }));
  };

  const handleDayChange = (index: number) => {
    setFormData((prev) => {
      const newDays = [...prev.availableDays];
      newDays[index] = !newDays[index];
      return {
        ...prev,
        availableDays: newDays,
      };
    });
  };

  const handleArrayItemChange = (
    arrayName:
      | "outcomes"
      | "outcomesMm"
      | "selectionCriteria"
      | "selectionCriteriaMm"
      | "howToApply"
      | "howToApplyMm",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      // Ensure array exists with fallback to empty array
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [arrayName]: newArray,
      };
    });
  };

  const addArrayItem = (
    arrayName:
      | "outcomes"
      | "outcomesMm"
      | "selectionCriteria"
      | "selectionCriteriaMm"
      | "howToApply"
      | "howToApplyMm"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), ""],
    }));
  };

  const removeArrayItem = (
    arrayName:
      | "outcomes"
      | "outcomesMm"
      | "selectionCriteria"
      | "selectionCriteriaMm"
      | "howToApply"
      | "howToApplyMm",
    index: number
  ) => {
    setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [arrayName]: newArray.length ? newArray : [""], // Ensure at least one empty item
      };
    });
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "questionMm" | "answer" | "answerMm",
    value: string
  ) => {
    setFormData((prev) => {
      const newFaq = [...(prev.faq || [])];

      // Ensure FAQ item exists at this index
      if (!newFaq[index]) {
        newFaq[index] = {
          question: "",
          questionMm: "",
          answer: "",
          answerMm: "",
        };
      }

      // Update the field
      newFaq[index] = {
        ...newFaq[index],
        [field]: value,
      };

      return {
        ...prev,
        faq: newFaq,
      };
    });
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faq: [
        ...(prev.faq || []),
        {
          question: "",
          questionMm: "",
          answer: "",
          answerMm: "",
        },
      ],
    }));
  };

  const removeFaq = (index: number) => {
    setFormData((prev) => {
      const newFaq = [...(prev.faq || [])];
      newFaq.splice(index, 1);

      // Ensure at least one FAQ item remains
      if (newFaq.length === 0) {
        newFaq.push({
          question: "",
          questionMm: "",
          answer: "",
          answerMm: "",
        });
      }

      return {
        ...prev,
        faq: newFaq,
      };
    });
  };

  const toggleBadge = (badge: BadgeOption) => {
    setFormData((prev) => {
      const badges = prev.badges || [];
      const badgeIndex = badges.findIndex((b) => b.text === badge.text);

      if (badgeIndex >= 0) {
        const newBadges = [...badges];
        newBadges.splice(badgeIndex, 1);
        return {
          ...prev,
          badges: newBadges,
        };
      } else {
        return {
          ...prev,
          badges: [...badges, badge],
        };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImageList((prev) => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleOrganizationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      organizationId: value,
    }));
  };
  const handleLocationChange = (locationData: {
    province: string;
    district: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      province: locationData.province,
      district: locationData.district,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // ADD THIS VALIDATION BEFORE SUBMISSION:
    if (!formData.startDate || formData.startDate === "") {
      setError("Start date is required");
      setIsLoading(false);
      return;
    }

    if (!formData.endDate || formData.endDate === "") {
      setError("End date is required");
      setIsLoading(false);
      return;
    }

    // ADD ORGANIZATION VALIDATION:
    if (!formData.organizationId || formData.organizationId === "") {
      setError("Organization selection is required");
      setIsLoading(false);
      return;
    }

    // Add debugging here
    console.log("Form data before submission:", formData);
    console.log("How to Apply data:", formData.howToApply);
    console.log("How to Apply MM data:", formData.howToApplyMm);

    // THIS DEBUG CODE HERE (before cleanedFormData processing):
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Form ageMin:", formData.ageMin, typeof formData.ageMin);
    console.log("Form ageMax:", formData.ageMax, typeof formData.ageMax);

    // IMPORTANT: Ensure howToApply arrays are properly filtered and encode estimated date preferences
    const cleanedFormData = {
      ...formData,
      document: formData.document || "", // Convert null/undefined to empty string
      documentMm: formData.documentMm || "",
      howToApply: formData.howToApply.filter((step) => step.trim() !== ""),
      howToApplyMm: formData.howToApplyMm.filter((step) => step.trim() !== ""),
      // Ensure organizationId is not null or empty
      organizationId: formData.organizationId, // Don't allow null/empty
      // Handle age fields - send null for empty values but ensure they're properly typed
      ageMin:
        formData.ageMin === null || formData.ageMin === undefined
          ? null
          : Number(formData.ageMin),
      ageMax:
        formData.ageMax === null || formData.ageMax === undefined
          ? null
          : Number(formData.ageMax),
      // Encode the display preferences into the estimated date field
      estimatedDate: formData.estimatedDate
        ? `${formData.estimatedDate}|${
            formData.showEstimatedForStartDate ? "1" : "0"
          }|${formData.showEstimatedForApplyByDate ? "1" : "0"}`
        : "",
      estimatedDateMm: formData.estimatedDateMm
        ? `${formData.estimatedDateMm}|${
            formData.showEstimatedForStartDate ? "1" : "0"
          }|${formData.showEstimatedForApplyByDate ? "1" : "0"}`
        : "",
    };

    // THIS DEBUG CODE HERE (after cleanedFormData processing):
    console.log("=== FORM CLEANED DATA DEBUG ===");
    console.log(
      "Cleaned ageMin:",
      cleanedFormData.ageMin,
      typeof cleanedFormData.ageMin
    );
    console.log(
      "Cleaned ageMax:",
      cleanedFormData.ageMax,
      typeof cleanedFormData.ageMax
    );

    // Remove UI-only fields before submission
    delete (cleanedFormData as Partial<CourseFormData>)
      .showEstimatedForStartDate;
    delete (cleanedFormData as Partial<CourseFormData>)
      .showEstimatedForApplyByDate;

    console.log("Cleaned form data:", cleanedFormData);
    console.log("Final organizationId:", cleanedFormData.organizationId);

    try {
      const formDataToSend = new FormData();
      const jsonData = {
        ...cleanedFormData,
        images: undefined,
      };

      console.log("JSON data being sent:", jsonData);
      formDataToSend.append("data", JSON.stringify(jsonData));

      // Append new images
      formData.images.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });

      // Append existing images that were kept
      formDataToSend.append(
        "existingImages",
        JSON.stringify(existingImageList)
      );

      const url =
        mode === "create" ? "/api/courses" : `/api/courses/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";
        try {
          const data = await response.json();
          if (data.error) {
            errorMessage = data.error;
          } else if (Array.isArray(data) && data.length > 0) {
            // Handle validation errors array
            errorMessage = data.map((err) => err.message || err).join(", ");
          } else if (data.message) {
            errorMessage = data.message;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      router.push("/dashboard/courses");
      router.refresh();
    } catch (err) {
      console.error("Error submitting course:", err);

      let errorMessage = "An unexpected error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err && typeof err === "object") {
        // Handle case where err might be a response object
        if ("message" in err) {
          errorMessage = String(err.message);
        } else if ("error" in err) {
          errorMessage = String(err.error);
        } else {
          errorMessage = "Server error - please check your input and try again";
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create New Course" : "Edit Course"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={`${
                isMobile ? "flex flex-col space-y-1" : "grid grid-cols-5"
              } mb-8`}
            >
              <TabsTrigger
                value="basic-info"
                className={isMobile ? "w-full" : ""}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="dates-fees"
                className={isMobile ? "w-full" : ""}
              >
                Dates & Fees
              </TabsTrigger>
              <TabsTrigger value="content" className={isMobile ? "w-full" : ""}>
                Content
              </TabsTrigger>
              <TabsTrigger value="images" className={isMobile ? "w-full" : ""}>
                Images & Badges
              </TabsTrigger>
              <TabsTrigger value="faq" className={isMobile ? "w-full" : ""}>
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="space-y-4">
              {/* Organization Select - Added for Platform Admin */}
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization *</Label>
                <Select
                  value={formData.organizationId || ""}
                  onValueChange={handleOrganizationChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {organizations.length === 0 && (
                  <p className="text-xs text-red-500">
                    No organizations found. Please create an organization first.
                  </p>
                )}
                {(!formData.organizationId ||
                  formData.organizationId === "") && (
                  <p className="text-xs text-red-500">
                    Organization selection is required
                  </p>
                )}
              </div>

              {/* Title - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title ?? ""}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="titleMm"
                      name="titleMm"
                      value={formData.titleMm ?? ""}
                      onChange={handleTextChange}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="subtitle"
                      name="subtitle"
                      value={formData.subtitle ?? ""}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="subtitleMm"
                      name="subtitleMm"
                      value={formData.subtitleMm ?? ""}
                      onChange={handleTextChange}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Course Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Course Address (Optional)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleTextChange}
                  placeholder="If different from organization address"
                />
              </div>

              {/* Location - Updated to use LocationSelector */}
              <LocationSelector
                value={{
                  province: formData.province,
                  district: formData.district,
                }}
                onChange={handleLocationChange}
                disabled={isLoading}
                key={`${formData.province}-${formData.district}`}
              />

              {/* Age Requirements - Fixed controlled input */}
              <div className="space-y-2">
                <Label htmlFor="ageMin">
                  <Users className="h-4 w-4 inline mr-1" />
                  Age Requirements (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Minimum Age
                    </div>
                    <Input
                      id="ageMin"
                      name="ageMin"
                      type="number"
                      min="1"
                      value={formData.ageMin || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          ageMin: value === "" ? null : parseInt(value) || null,
                        }));
                      }}
                      placeholder="Leave blank for no minimum age limit"
                      autoComplete="off"
                      // REMOVE: required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Maximum Age
                    </div>
                    <Input
                      id="ageMax"
                      name="ageMax"
                      type="number"
                      min="1"
                      value={formData.ageMax || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          ageMax: value === "" ? null : parseInt(value) || null,
                        }));
                      }}
                      placeholder="Leave blank for no maximum age limit"
                      autoComplete="off"
                      // REMOVE: required
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave both fields blank if there are no age restrictions for
                  this course
                </p>
              </div>

              {/* Required Documents - Made Optional */}
              <div className="space-y-2">
                <Label htmlFor="document">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Required Documents (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Textarea
                      id="document"
                      name="document"
                      value={formData.document ?? ""}
                      onChange={handleTextChange}
                      placeholder="e.g. ID card, passport photos, etc. Leave blank if no documents required"
                      // REMOVED: required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Textarea
                      id="documentMm"
                      name="documentMm"
                      value={formData.documentMm ?? ""}
                      onChange={handleTextChange}
                      placeholder="Myanmar translation..."
                      dir="auto"
                      // REMOVED: required
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave blank if no specific documents are required for this
                  course
                </p>
              </div>

              {/* Schedule - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="schedule">
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Schedule
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="schedule"
                      name="schedule"
                      value={formData.schedule ?? ""}
                      onChange={handleTextChange}
                      required
                      placeholder="e.g. Mon, Wed, Fri: 2-4 PM"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="scheduleMm"
                      name="scheduleMm"
                      value={formData.scheduleMm ?? ""}
                      onChange={handleTextChange}
                      dir="auto"
                      placeholder="Myanmar translation..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Days</Label>
                <div
                  className={`flex ${
                    isMobile ? "flex-col gap-2" : "flex-wrap gap-3"
                  } mt-2`}
                >
                  {dayNames.map((day, index) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${index}`}
                        checked={formData.availableDays[index] || false}
                        onChange={() => handleDayChange(index)}
                      />
                      <label
                        htmlFor={`day-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* NEW TAB: Dates & Fees */}
            <TabsContent value="dates-fees" className="space-y-5">
              {/* Start Date and End Date - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate ?? ""}
                    onChange={handleTextChange}
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate ?? ""}
                    onChange={handleTextChange}
                    required
                  />
                </div>
              </div>

              {/* Apply By Date */}
              <div className="space-y-2">
                <Label htmlFor="applyByDate">Application Deadline</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="applyByDate"
                      name="applyByDate"
                      type="date"
                      value={formData.applyByDate}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Date Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Estimated Date Options
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Configure when to display the estimated date. If neither
                    option is selected, estimated dates will not be shown on
                    course cards.
                  </p>

                  {/* Estimated Date Input Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDate">
                      Estimated Date (Optional)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          English
                        </div>
                        <Input
                          id="estimatedDate"
                          name="estimatedDate"
                          value={formData.estimatedDate}
                          onChange={handleTextChange}
                          placeholder="e.g., Early 2024, Spring semester"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Myanmar
                        </div>
                        <Input
                          id="estimatedDateMm"
                          name="estimatedDateMm"
                          value={formData.estimatedDateMm}
                          onChange={handleTextChange}
                          placeholder="Myanmar translation..."
                          dir="auto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes for display options - Only show if estimated date is filled */}
                  {(formData.estimatedDate || formData.estimatedDateMm) && (
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-sm font-medium">
                        Display estimated date for:
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showEstimatedForStartDate"
                            checked={formData.showEstimatedForStartDate}
                            onChange={() =>
                              handleCheckboxChange("showEstimatedForStartDate")
                            }
                          />
                          <label
                            htmlFor="showEstimatedForStartDate"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Start Date (show estimated date badge next to start
                            date)
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showEstimatedForApplyByDate"
                            checked={formData.showEstimatedForApplyByDate}
                            onChange={() =>
                              handleCheckboxChange(
                                "showEstimatedForApplyByDate"
                              )
                            }
                          />
                          <label
                            htmlFor="showEstimatedForApplyByDate"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Application Deadline (show estimated date badge next
                            to deadline)
                          </label>
                        </div>
                      </div>

                      {!formData.showEstimatedForStartDate &&
                        !formData.showEstimatedForApplyByDate && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            ⚠️ Estimated date is entered but won&apos;t be
                            displayed. Select at least one option above to show
                            it.
                          </p>
                        )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Use estimated dates for approximate or flexible timing when
                    exact dates are not available
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => handleNumberChange(e, "duration")}
                  required
                  placeholder="Number of days"
                />
              </div>

              {/* Fee Amount */}
              <div className="space-y-2">
                <Label htmlFor="feeAmount">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Course Fee (THB)
                </Label>
                <Input
                  id="feeAmount"
                  name="feeAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.feeAmount}
                  onChange={(e) => handleNumberChange(e, "feeAmount")}
                  required
                  placeholder="e.g. 500.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter 0 for free courses
                </p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-5">
              {/* Description - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description ?? ""}
                      onChange={handleTextChange}
                      rows={isMobile ? 4 : 5}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Textarea
                      id="descriptionMm"
                      name="descriptionMm"
                      value={formData.descriptionMm ?? ""}
                      onChange={handleTextChange}
                      rows={isMobile ? 4 : 5}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Details - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="scheduleDetails">Schedule Details</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Textarea
                      id="scheduleDetails"
                      name="scheduleDetails"
                      value={formData.scheduleDetails ?? ""}
                      onChange={handleTextChange}
                      rows={3}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Textarea
                      id="scheduleDetailsMm"
                      name="scheduleDetailsMm"
                      value={formData.scheduleDetailsMm ?? ""}
                      onChange={handleTextChange}
                      rows={3}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Learning Outcomes - English and Myanmar */}
              <div className="space-y-3">
                <Label>Learning Outcomes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    {(formData.outcomes || [""]).map((outcome, index) => (
                      <div key={`outcome-${index}`} className="flex gap-2 mb-2">
                        <Input
                          value={outcome ?? ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              "outcomes",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="e.g. Students will be able to..."
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("outcomes", index)}
                          disabled={(formData.outcomes?.length || 0) <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("outcomes")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Outcome
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    {(formData.outcomesMm || [""]).map((outcome, index) => (
                      <div
                        key={`outcomeMm-${index}`}
                        className="flex gap-2 mb-2"
                      >
                        <Input
                          value={outcome ?? ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              "outcomesMm",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Myanmar translation..."
                          dir="auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("outcomesMm", index)}
                          disabled={(formData.outcomesMm?.length || 0) <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("outcomesMm")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Myanmar Outcome
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selection Criteria - English and Myanmar */}
              <div className="space-y-3">
                <Label>Selection Criteria</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    {(formData.selectionCriteria || [""]).map(
                      (criteria, index) => (
                        <div
                          key={`criteria-${index}`}
                          className="flex gap-2 mb-2"
                        >
                          <Input
                            value={criteria ?? ""}
                            onChange={(e) =>
                              handleArrayItemChange(
                                "selectionCriteria",
                                index,
                                e.target.value
                              )
                            }
                            placeholder="e.g. Open to residents aged 15+"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              removeArrayItem("selectionCriteria", index)
                            }
                            disabled={
                              (formData.selectionCriteria?.length || 0) <= 1
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("selectionCriteria")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criteria
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    {(formData.selectionCriteriaMm || [""]).map(
                      (criteria, index) => (
                        <div
                          key={`criteriaMm-${index}`}
                          className="flex gap-2 mb-2"
                        >
                          <Input
                            value={criteria ?? ""}
                            onChange={(e) =>
                              handleArrayItemChange(
                                "selectionCriteriaMm",
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Myanmar translation..."
                            dir="auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              removeArrayItem("selectionCriteriaMm", index)
                            }
                            disabled={
                              (formData.selectionCriteriaMm?.length || 0) <= 1
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("selectionCriteriaMm")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Myanmar Criteria
                    </Button>
                  </div>
                </div>
              </div>

              {/* How to Apply - English and Myanmar - ADD THIS SECTION AFTER SELECTION CRITERIA */}
              <div className="space-y-3">
                <Label>How to Apply (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    {(formData.howToApply || [""]).map((step, index) => (
                      <div
                        key={`howToApply-${index}`}
                        className="flex gap-2 mb-2"
                      >
                        <Input
                          value={step ?? ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              "howToApply",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="e.g. Submit application form online"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("howToApply", index)}
                          disabled={(formData.howToApply?.length || 0) <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("howToApply")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    {(formData.howToApplyMm || [""]).map((step, index) => (
                      <div
                        key={`howToApplyMm-${index}`}
                        className="flex gap-2 mb-2"
                      >
                        <Input
                          value={step ?? ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              "howToApplyMm",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Myanmar translation..."
                          dir="auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("howToApplyMm", index)}
                          disabled={(formData.howToApplyMm?.length || 0) <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("howToApplyMm")}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Myanmar Step
                    </Button>
                  </div>
                </div>
              </div>

              {/* Apply Button Customization - NEW SECTION */}
              <div className="space-y-3">
                <Label>Apply Button Customization (Optional)</Label>

                {/* Apply Button Text */}
                <div className="space-y-2">
                  <Label htmlFor="applyButtonText">Apply Button Text</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        English
                      </div>
                      <Input
                        id="applyButtonText"
                        name="applyButtonText"
                        value={formData.applyButtonText ?? ""}
                        onChange={handleTextChange}
                        placeholder="e.g. Apply Now, Register Here, Join Course"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Myanmar
                      </div>
                      <Input
                        id="applyButtonTextMm"
                        name="applyButtonTextMm"
                        value={formData.applyButtonTextMm ?? ""}
                        onChange={handleTextChange}
                        placeholder="Myanmar translation..."
                        dir="auto"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use default Apply Now text
                  </p>
                </div>

                {/* Apply Link - Only show if button text is provided */}
                {(formData.applyButtonText || formData.applyButtonTextMm) && (
                  <div className="space-y-2">
                    <Label htmlFor="applyLink">
                      Apply Link (Required when button text is provided)
                    </Label>
                    <Input
                      id="applyLink"
                      name="applyLink"
                      type="url"
                      value={formData.applyLink ?? ""}
                      onChange={handleTextChange}
                      placeholder="https://example.com/apply or mailto:contact@organization.com"
                      required={
                        !!(
                          formData.applyButtonText || formData.applyButtonTextMm
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a website URL (https://...) or email (mailto:...)
                      where users can apply
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-5">
              <div className="space-y-3">
                <Label>Course Images</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Display existing images */}
                  {existingImageList.map((url, index) => (
                    <div
                      key={`existing-image-${index}`}
                      className="relative h-40 border rounded-md overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Existing course image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-br-md">
                        Existing
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-7 h-7"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Display newly uploaded images */}
                  {formData.images.map((file, index) => (
                    <div
                      key={`new-image-${index}`}
                      className="relative h-40 border rounded-md overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New course image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-br-md">
                        New
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-7 h-7"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <div className="h-40 border border-dashed rounded-md flex flex-col items-center justify-center p-4 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Upload course images
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      PNG, JPG or WebP
                    </p>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      Select Files
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Course Badges</Label>
                <div className="flex flex-wrap gap-2">
                  {badgeOptions.map((badge) => {
                    const isSelected = (formData.badges || []).some(
                      (b) => b.text === badge.text
                    );
                    return (
                      <Button
                        key={badge.text}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleBadge(badge)}
                        className="py-1"
                        style={{
                          backgroundColor: isSelected
                            ? badge.backgroundColor
                            : undefined,
                          color: isSelected ? badge.color : undefined,
                        }}
                      >
                        {badge.text}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-5">
              <div className="space-y-4">
                <div
                  className={`${
                    isMobile
                      ? "flex flex-col space-y-2"
                      : "flex justify-between items-center"
                  }`}
                >
                  <Label>Frequently Asked Questions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFaq}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>

                {(formData.faq || []).map((faq, index) => (
                  <div
                    key={`faq-${index}`}
                    className={`space-y-2 border p-${
                      isMobile ? "3" : "4"
                    } rounded-md`}
                  >
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`faq-question-${index}`}>
                        Question {index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFaq(index)}
                        disabled={(formData.faq?.length || 0) <= 1}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Question - English and Myanmar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          English
                        </div>
                        <Input
                          id={`faq-question-${index}`}
                          value={faq?.question ?? ""}
                          onChange={(e) =>
                            handleFaqChange(index, "question", e.target.value)
                          }
                          placeholder="e.g. What materials do I need to bring?"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Myanmar
                        </div>
                        <Input
                          id={`faq-questionMm-${index}`}
                          value={faq?.questionMm ?? ""}
                          onChange={(e) =>
                            handleFaqChange(index, "questionMm", e.target.value)
                          }
                          placeholder="Myanmar translation..."
                          dir="auto"
                        />
                      </div>
                    </div>

                    {/* Answer - English and Myanmar */}
                    <Label>Answer</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          English
                        </div>
                        <Textarea
                          id={`faq-answer-${index}`}
                          value={faq?.answer ?? ""}
                          onChange={(e) =>
                            handleFaqChange(index, "answer", e.target.value)
                          }
                          placeholder="e.g. All learning materials will be provided in class."
                          rows={3}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Myanmar
                        </div>
                        <Textarea
                          id={`faq-answerMm-${index}`}
                          value={faq?.answerMm ?? ""}
                          onChange={(e) =>
                            handleFaqChange(index, "answerMm", e.target.value)
                          }
                          placeholder="Myanmar translation..."
                          rows={3}
                          dir="auto"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter
          className={`${
            isMobile ? "flex-col space-y-2" : "flex justify-between"
          }`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/courses")}
            disabled={isLoading}
            className={isMobile ? "w-full" : ""}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.organizationId ||
              formData.organizationId === ""
            }
            className={isMobile ? "w-full" : ""}
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
              ? "Create Course"
              : "Update Course"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

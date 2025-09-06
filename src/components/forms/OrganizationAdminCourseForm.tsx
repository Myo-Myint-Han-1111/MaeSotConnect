import React, { useState, useEffect, useMemo } from "react";
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
import LocationSelector from "@/components/forms/LocationSelector";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Info,
  Loader2,
} from "lucide-react";
import {
  compressImage,
  validateImageFile,
  formatFileSize,
} from "@/lib/imageCompression";

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
  startByDate: string;
  startByDateMm: string;
  startDate: string;
  endDate: string;
  duration: number | null;
  durationUnit: string;
  durationMm: number | null;
  durationUnitMm?: string;
  schedule: string;
  scheduleMm: string;
  feeAmount: number | null;
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

interface BadgeOption {
  text: string;
  color: string;
  backgroundColor: string;
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  mode: "create" | "edit";
  existingImages?: string[];
  draftMode?: boolean; // For advocates/org admins to submit as drafts
  backUrl?: string; // Custom back URL
  editDraftId?: string; // ID of existing draft being edited
  onSubmit?: (formData: CourseFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
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

// Helper function to check if estimated date is already encoded
const isAlreadyEncoded = (dateString: string): boolean => {
  if (!dateString) return false;
  const parts = dateString.split("|");
  return (
    parts.length === 3 &&
    (parts[1] === "0" || parts[1] === "1") &&
    (parts[2] === "0" || parts[2] === "1")
  );
};

/**
 * Parses estimated date strings that may contain encoded preference flags
 * Format: "date|startFlag|applyFlag" where flags are "1" or "0"
 */
const parseExistingEstimatedDate = (
  estimatedDateString: string | null | undefined
) => {
  if (!estimatedDateString || estimatedDateString === "") {
    return {
      estimatedDate: "",
      showEstimatedForStartDate: false,
      showEstimatedForApplyByDate: false,
    };
  }

  // Handle corrupted data with too many pipe symbols
  const parts = estimatedDateString.split("|");

  // If we have exactly 3 parts, it's properly encoded
  if (parts.length === 3) {
    return {
      estimatedDate: parts[0],
      showEstimatedForStartDate: parts[1] === "1",
      showEstimatedForApplyByDate: parts[2] === "1",
    };
  }

  // If we have more than 3 parts, it's corrupted - take only the first part as the actual date
  if (parts.length > 3) {
    console.warn(
      "Corrupted estimated date detected, cleaning:",
      estimatedDateString
    );
    return {
      estimatedDate: parts[0], // Only use the actual date text
      showEstimatedForStartDate: true, // Default to showing
      showEstimatedForApplyByDate: true, // Default to showing
    };
  }

  // Legacy format - default to showing for both (backward compatibility)
  return {
    estimatedDate: estimatedDateString,
    showEstimatedForStartDate: true,
    showEstimatedForApplyByDate: true,
  };
};

export default function OrganizationAdminCourseForm({
  initialData,
  mode,
  existingImages,
  draftMode = false,
  backUrl = "/org-admin",
  editDraftId,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isMobile, setIsMobile] = useState(false);
  const [existingImageList, setExistingImageList] = useState<string[]>(
    existingImages || []
  );
  const [isCompressing, setIsCompressing] = useState(false);

  // Initialize form data using lazy initialization for performance
  const [formData, setFormData] = useState<CourseFormData>(() => {
    // Parse estimated date data from initialData if provided
    const parsedEstimatedData = initialData?.estimatedDate
      ? parseExistingEstimatedDate(initialData.estimatedDate)
      : {
          estimatedDate: "",
          showEstimatedForStartDate: false,
          showEstimatedForApplyByDate: false,
        };

    const parsedEstimatedDataMm = initialData?.estimatedDateMm
      ? parseExistingEstimatedDate(initialData.estimatedDateMm)
      : {
          estimatedDate: "",
          showEstimatedForStartDate: false,
          showEstimatedForApplyByDate: false,
        };

    return {
      title: initialData?.title || "",
      titleMm: initialData?.titleMm || "",
      subtitle: initialData?.subtitle || "",
      subtitleMm: initialData?.subtitleMm || "",
      province: initialData?.province || "",
      district: initialData?.district || "",
      address: initialData?.address || "",
      applyByDate: initialData?.applyByDate || "",
      applyByDateMm: initialData?.applyByDateMm || "",
      startByDate: initialData?.startByDate || "",
      startByDateMm: initialData?.startByDateMm || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      duration: initialData?.duration || null,
      durationUnit: initialData?.durationUnit || "DAYS",
      durationMm: initialData?.durationMm || null,
      durationUnitMm: initialData?.durationUnitMm,
      schedule: initialData?.schedule || "",
      scheduleMm: initialData?.scheduleMm || "",
      feeAmount: initialData?.feeAmount ?? null,
      ageMin: initialData?.ageMin || null,
      ageMax: initialData?.ageMax || null,
      document: initialData?.document || "",
      documentMm: initialData?.documentMm || "",
      availableDays: initialData?.availableDays || [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      description: initialData?.description || "",
      descriptionMm: initialData?.descriptionMm || "",
      outcomes: initialData?.outcomes || [""],
      outcomesMm: initialData?.outcomesMm || [""],
      scheduleDetails: initialData?.scheduleDetails || "",
      scheduleDetailsMm: initialData?.scheduleDetailsMm || "",
      selectionCriteria: initialData?.selectionCriteria || [""],
      selectionCriteriaMm: initialData?.selectionCriteriaMm || [""],
      howToApply: initialData?.howToApply || [""],
      howToApplyMm: initialData?.howToApplyMm || [""],
      applyButtonText: initialData?.applyButtonText || "",
      applyButtonTextMm: initialData?.applyButtonTextMm || "",
      applyLink: initialData?.applyLink || "",
      estimatedDate: parsedEstimatedData.estimatedDate,
      estimatedDateMm: parsedEstimatedDataMm.estimatedDate,
      showEstimatedForStartDate:
        parsedEstimatedData.showEstimatedForStartDate ||
        parsedEstimatedDataMm.showEstimatedForStartDate,
      showEstimatedForApplyByDate:
        parsedEstimatedData.showEstimatedForApplyByDate ||
        parsedEstimatedDataMm.showEstimatedForApplyByDate,
      images: [],
      badges: initialData?.badges || [],
      faq: initialData?.faq || [
        { question: "", questionMm: "", answer: "", answerMm: "" },
      ],
    };
  });

  // Calculate total file size for Vercel limit warning
  const totalFileSize = formData.images.reduce(
    (total, file) => total + file.size,
    0
  );
  const VERCEL_LIMIT = 4 * 1024 * 1024; // 4MB in bytes
  const isNearLimit = totalFileSize > VERCEL_LIMIT * 0.8; // Warning at 80% of limit
  const isOverLimit = totalFileSize > VERCEL_LIMIT;

  useEffect(() => {
    // Use matchMedia for better performance than window.innerWidth
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (existingImages) {
      setExistingImageList(existingImages);
    }
  }, [existingImages]);

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
      // If the input is completely empty, set to null (no auto-fill)
      if (
        inputValue === "" ||
        inputValue === null ||
        inputValue === undefined
      ) {
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
        setFormData((prev) => ({
          ...prev,
          [fieldName]: numericValue,
        }));
      } else {
        // For invalid values (0, negative, or NaN), set to null
        setFormData((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
      }
    } else {
      // Handle other numeric fields normally (duration, feeAmount, etc.)
      if (
        inputValue === "" ||
        inputValue === null ||
        inputValue === undefined
      ) {
        // Allow clearing the field for duration
        if (fieldName === "duration") {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: null,
          }));
        } else {
          // For other fields like feeAmount, use 0 as default
          setFormData((prev) => ({
            ...prev,
            [fieldName]: 0,
          }));
        }
      } else {
        const value = parseInt(inputValue, 10) || 0;
        setFormData((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setIsCompressing(true);

    try {
      const compressedImages: File[] = [];

      for (const file of fileArray) {
        // Validate file
        const validationError = validateImageFile(file);
        if (validationError) {
          alert(`${file.name}: ${validationError}`);
          continue;
        }

        try {
          // Compress image
          const result = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8,
            maxSizeKB: 500,
          });

          compressedImages.push(result.file);
        } catch (_compressionError) {
          alert(
            `Failed to compress ${file.name}. Please try a different image.`
          );
        }
      }

      // Update form data with compressed images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedImages],
      }));
    } catch (_error) {
      alert("Failed to process images. Please try again.");
    } finally {
      setIsCompressing(false);
    }

    // Clear the input
    e.target.value = "";
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

  // Memoize the location value to prevent infinite re-renders
  const locationValue = useMemo(
    () => ({
      province: formData.province,
      district: formData.district,
    }),
    [formData.province, formData.district]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Different validation for draft mode vs regular course creation
    if (!draftMode) {
      // Full validation for regular course creation
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
    } else {
      // Basic validation for draft submissions
      if (!formData.title || formData.title.trim() === "") {
        setError("Course title is required");
        setIsLoading(false);
        return;
      }

      // FOR EDITING MODE: Don't require all 7 days to be selected
      // Only validate if this is a new course creation, not editing
      if (mode === "create") {
        const hasSelectedDays = formData.availableDays.some(
          (day) => day === true
        );
        if (!hasSelectedDays) {
          setError("Please select at least one available day");
          setIsLoading(false);
          return;
        }
      }
    }

    // IMPORTANT: Ensure howToApply arrays are properly filtered and encode estimated date preferences
    const cleanedFormData = {
      ...formData,
      document: formData.document || "", // Convert null/undefined to empty string
      documentMm: formData.documentMm || "",
      howToApply: formData.howToApply.filter((step) => step.trim() !== ""),
      howToApplyMm: formData.howToApplyMm.filter((step) => step.trim() !== ""),
      startByDate: formData.startByDate || "",
      startByDateMm: formData.startByDateMm || "",
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
        ? isAlreadyEncoded(formData.estimatedDate)
          ? formData.estimatedDate // Already encoded, don't re-encode
          : `${formData.estimatedDate}|${
              formData.showEstimatedForStartDate ? "1" : "0"
            }|${formData.showEstimatedForApplyByDate ? "1" : "0"}`
        : "",
      estimatedDateMm: formData.estimatedDateMm
        ? isAlreadyEncoded(formData.estimatedDateMm)
          ? formData.estimatedDateMm // Already encoded, don't re-encode
          : `${formData.estimatedDateMm}|${
              formData.showEstimatedForStartDate ? "1" : "0"
            }|${formData.showEstimatedForApplyByDate ? "1" : "0"}`
        : "",
    };

    // Remove UI-only fields before submission
    delete (cleanedFormData as Partial<CourseFormData>)
      .showEstimatedForStartDate;
    delete (cleanedFormData as Partial<CourseFormData>)
      .showEstimatedForApplyByDate;

    // If external onSubmit is provided, use it instead of internal logic
    if (onSubmit) {
      try {
        await onSubmit(cleanedFormData);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("External onSubmit error:", error);
        setError("Failed to submit form. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (draftMode) {
        // Submit as draft to the org admin API with image support
        const formDataToSend = new FormData();

        // ENSURE ALL FORM DATA IS PRESERVED
        const completeFormData = {
          ...cleanedFormData,
          // Explicitly include critical fields that might be missing
          availableDays: formData.availableDays || [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ],
          badges: formData.badges || [],
          imageUrls: [] as string[], // Fix TypeScript type inference
        };

        // Include existing images that were kept
        if (existingImageList.length > 0) {
          const existingImages = existingImageList.filter(
            (url) => !url.startsWith("blob:") // Exclude blob URLs (new uploads)
          );
          completeFormData.imageUrls = existingImages;
        }

        const draftData = {
          title: completeFormData.title,
          type: "COURSE",
          content: completeFormData,
          status: "PENDING", // Submit directly for review
        };

        formDataToSend.append("data", JSON.stringify(draftData));

        // Append images for draft submissions
        formData.images.forEach((file, index) => {
          formDataToSend.append(`image_${index}`, file);
        });

        let url: string;
        let method: string;

        // ✅ CORRECTED - All use main drafts API
        if (editDraftId) {
          // Editing an existing draft
          url = `/api/drafts/${editDraftId}`;
          method = "PATCH";
        } else {
          // Creating a new draft (both new drafts and from existing courses)
          url = "/api/drafts";
          method = "POST";
        }

        const response = await fetch(url, {
          method: method,
          body: formDataToSend, // Send FormData instead of JSON
        });

        if (!response.ok) {
          let errorMessage = "Something went wrong";
          try {
            const data = await response.json();
            if (data.error) {
              errorMessage = data.error;
            } else if (data.message) {
              errorMessage = data.message;
            }
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Redirect to org admin drafts with success message
        const successParam = editDraftId ? "updated=true" : "submitted=true";
        router.push(`/org-admin/drafts?${successParam}`);
        router.refresh();
      } else {
        // Regular course submission
        const formDataToSend = new FormData();
        const jsonData = {
          ...cleanedFormData,
          images: undefined,
        };

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
          mode === "create"
            ? "/api/courses"
            : `/api/courses/${initialData?.id}`;
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

        router.push(backUrl || "/org-admin");
        router.refresh();
      }
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

  const handleSaveDraft = async () => {
    if (!formData.title || formData.title.trim() === "") {
      setError("Course title is required to save draft");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const draftData = {
        title: formData.title,
        type: "COURSE",
        content: formData,
        status: "DRAFT", // Save as draft, not submitted for review
      };

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(draftData));

      // Append images for draft submissions
      formData.images.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });

      // Include existing images that were kept
      if (existingImageList.length > 0) {
        const existingImages = existingImageList.filter(
          (url) => !url.startsWith("blob:") // Exclude blob URLs (new uploads)
        );
        if (existingImages.length > 0) {
          Object.assign(formData, { imageUrls: existingImages });
          draftData.content = formData;
          formDataToSend.set("data", JSON.stringify(draftData));
        }
      }

      let url: string;
      let method: string;

      if (editDraftId) {
        // ✅ Editing an existing draft - use the drafts API
        url = `/api/drafts/${editDraftId}`;
        method = "PATCH";
      } else {
        // ✅ Creating a new draft - use the drafts API
        url = "/api/drafts";
        method = "POST";
      }

      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";
        try {
          const data = await response.json();
          if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Redirect to org admin drafts with success message
      router.push("/org-admin/drafts?saved=true");
    } catch (err) {
      console.error("Error saving draft:", err);
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="[&_input]:bg-white [&_textarea]:bg-white [&_button[role=combobox]]:bg-white bg-white">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>
                {draftMode
                  ? "Submit Course Draft"
                  : mode === "create"
                  ? "Create New Course"
                  : "Edit Course"}
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
                  } mb-8 bg-gray-100 p-1 rounded-lg max-w-3xl mx-auto h-auto`}
                >
                  <TabsTrigger
                    value="basic-info"
                    className={`${
                      isMobile ? "w-full" : ""
                    } h-9 text-sm data-[state=active]:bg-white rounded-md`}
                  >
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="dates-fees"
                    className={`${
                      isMobile ? "w-full" : ""
                    } h-9 text-sm data-[state=active]:bg-white rounded-md`}
                  >
                    Dates & Fees
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className={`${
                      isMobile ? "w-full" : ""
                    } h-9 text-sm data-[state=active]:bg-white rounded-md`}
                  >
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className={`${
                      isMobile ? "w-full" : ""
                    } h-9 text-sm data-[state=active]:bg-white rounded-md`}
                  >
                    Images & Badges
                  </TabsTrigger>
                  <TabsTrigger
                    value="faq"
                    className={`${
                      isMobile ? "w-full" : ""
                    } h-9 text-sm data-[state=active]:bg-white rounded-md`}
                  >
                    FAQ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic-info" className="space-y-4">
                  {/* Title - English and Myanmar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title">Course Title*</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>
                            Enter the program name as youth would recognize it.
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            <strong>Example:</strong> &quot;Youth Champions
                            Program&quot;
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                          className={
                            !formData.title
                              ? "bg-white border-red-200 focus:border-red-500"
                              : "bg-white"
                          }
                          aria-invalid={!formData.title}
                          aria-describedby={
                            !formData.title ? "title-error" : undefined
                          }
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
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle - English and Myanmar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="subtitle">Subtitle*</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>
                            Write a brief description of what the program
                            offers. Keep it concise.
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            <strong>Example:</strong> &quot;Pre-university and
                            early career skill development&quot;
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                          className={
                            !formData.subtitle
                              ? "bg-white border-red-200 focus:border-red-500"
                              : "bg-white"
                          }
                          aria-invalid={!formData.subtitle}
                          aria-describedby={
                            !formData.subtitle ? "subtitle-error" : undefined
                          }
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
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Course Address</Label>
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
                    value={locationValue}
                    onChange={handleLocationChange}
                    disabled={isLoading}
                  />

                  {/* Age Requirements - Fixed controlled input */}
                  <div className="space-y-2">
                    <Label htmlFor="ageMin">
                      <Users className="h-4 w-4 inline mr-1" />
                      Age Requirements
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
                              ageMin:
                                value === "" ? null : parseInt(value) || null,
                            }));
                          }}
                          placeholder="Leave blank for no minimum age limit"
                          autoComplete="off"
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
                              ageMax:
                                value === "" ? null : parseInt(value) || null,
                            }));
                          }}
                          placeholder="Leave blank for no maximum age limit"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave both fields blank if there are no age restrictions
                      for this course
                    </p>
                  </div>

                  {/* Required Documents - Made Optional */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="document">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Required Documents
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>
                            List any documents youth need to provide when
                            applying. Leave blank if no documents are required.
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            <strong>Example:</strong> High school diploma, GED
                            certificate, or passport
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave blank if no specific documents are required for this
                      course
                    </p>
                  </div>
                </TabsContent>

                {/* NEW TAB: Dates & Fees */}
                <TabsContent value="dates-fees" className="space-y-5">
                  {/* Start Date and End Date - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="startDate">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Start Date*
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Select the date when the program begins.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate ?? ""}
                        onChange={handleTextChange}
                        required
                        className={
                          !formData.startDate
                            ? "border-red-200 focus:border-red-500"
                            : ""
                        }
                        aria-invalid={!formData.startDate}
                        aria-describedby={
                          !formData.startDate ? "startDate-error" : undefined
                        }
                      />

                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="showEstimatedForStartDate"
                          checked={formData.showEstimatedForStartDate}
                          onChange={() =>
                            handleCheckboxChange("showEstimatedForStartDate")
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="showEstimatedForStartDate"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                        >
                          Mark start date as estimated
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>
                                Check this if the start date may change by more
                                than one week. This will show an
                                &quot;estimated&quot; badge next to the start
                                date.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </label>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="endDate">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          End Date*
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Select the date when the program ends.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate ?? ""}
                        onChange={handleTextChange}
                        required
                        className={
                          !formData.endDate
                            ? "border-red-200 focus:border-red-500"
                            : ""
                        }
                        aria-invalid={!formData.endDate}
                        aria-describedby={
                          !formData.endDate ? "endDate-error" : undefined
                        }
                      />
                    </div>
                  </div>

                  {/* Application Deadline and Registration Start Date - Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="applyByDate">
                          Application Deadline
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>
                              Set the final date for youth to submit
                              applications.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="showEstimatedForApplyByDate"
                          checked={formData.showEstimatedForApplyByDate}
                          onChange={() =>
                            handleCheckboxChange("showEstimatedForApplyByDate")
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="showEstimatedForApplyByDate"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                        >
                          Mark as estimated
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>
                                Check this if the application deadline may
                                change. This will show an &quot;estimated&quot;
                                badge next to the deadline.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="startByDate">
                          Registration Start Date
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>
                              The date when applications/registration opens for
                              this course.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          English
                        </div>
                        <Input
                          id="startByDate"
                          name="startByDate"
                          type="date"
                          value={formData.startByDate}
                          onChange={handleTextChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave blank if registration is always open
                      </p>
                    </div>
                  </div>

                  {/* Estimated Date Text Fields - Show if either checkbox is checked */}
                  {(formData.showEstimatedForStartDate ||
                    formData.showEstimatedForApplyByDate) && (
                    <div className="space-y-2 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <Label>Estimated Date Text</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            English
                          </div>
                          <Input
                            id="estimatedDate"
                            name="estimatedDate"
                            value={formData.estimatedDate ?? ""}
                            onChange={handleTextChange}
                            placeholder="e.g. Late January, Early March, Mid-2025"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Myanmar
                          </div>
                          <Input
                            id="estimatedDateMm"
                            name="estimatedDateMm"
                            value={formData.estimatedDateMm ?? ""}
                            onChange={handleTextChange}
                            placeholder="Myanmar translation..."
                            dir="auto"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter text that describes when the date might change
                        (e.g., Late January, Early Spring, Mid-2025)
                      </p>
                    </div>
                  )}

                  {/* Duration and Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* English Duration and Unit */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="duration">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Duration*
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Enter the total duration of the program.</p>
                            <p className="mt-1 text-xs text-gray-600">
                              <strong>Example:</strong> 3 days, 2 weeks, 6
                              months, etc.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="1"
                          value={
                            formData.duration === null ? "" : formData.duration
                          }
                          onChange={(e) => handleNumberChange(e, "duration")}
                          required
                          placeholder="Number"
                          className={
                            !formData.duration || formData.duration <= 0
                              ? "border-red-200 focus:border-red-500"
                              : ""
                          }
                          aria-invalid={
                            !formData.duration || formData.duration <= 0
                          }
                          aria-describedby={
                            !formData.duration || formData.duration <= 0
                              ? "duration-error"
                              : undefined
                          }
                        />
                        <Select
                          value={formData.durationUnit || "DAYS"}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              durationUnit: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAYS">Days</SelectItem>
                            <SelectItem value="WEEKS">Weeks</SelectItem>
                            <SelectItem value="MONTHS">Months</SelectItem>
                            <SelectItem value="YEARS">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Course Fee */}
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
                      step="1"
                      value={
                        formData.feeAmount === null ? "" : formData.feeAmount
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setFormData((prev) => ({ ...prev, feeAmount: null }));
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setFormData((prev) => ({
                              ...prev,
                              feeAmount: numValue,
                            }));
                          }
                        }
                      }}
                      placeholder="Leave blank to hide, 0 for free, or enter amount"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank to hide fee, enter 0 for free courses, or
                      enter amount for paid courses
                    </p>
                  </div>

                  {/* Schedule - English and Myanmar */}
                  <div className="space-y-2">
                    <Label htmlFor="schedule">
                      <BookOpen className="h-4 w-4 inline mr-1" />
                      Schedule*
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
                          className={
                            !formData.schedule
                              ? "border-red-200 focus:border-red-500"
                              : ""
                          }
                          aria-invalid={!formData.schedule}
                          aria-describedby={
                            !formData.schedule ? "schedule-error" : undefined
                          }
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
                          <input
                            type="checkbox"
                            id={`day-${index}`}
                            checked={formData.availableDays[index] || false}
                            onChange={() => handleDayChange(index)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                          <div
                            key={`outcome-${index}`}
                            className="flex gap-2 mb-2"
                          >
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
                              onClick={() =>
                                removeArrayItem("outcomesMm", index)
                              }
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
                                placeholder="e.g. Intermediate-beginner English"
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
                                  (formData.selectionCriteriaMm?.length || 0) <=
                                  1
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

                  {/* How to Apply - English and Myanmar */}
                  <div className="space-y-3">
                    <Label>How to Apply</Label>
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
                              onClick={() =>
                                removeArrayItem("howToApply", index)
                              }
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
                              onClick={() =>
                                removeArrayItem("howToApplyMm", index)
                              }
                              disabled={
                                (formData.howToApplyMm?.length || 0) <= 1
                              }
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

                  {/* Apply Button Customization */}
                  <div className="space-y-3">
                    <Label>Apply Button Customization</Label>

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
                    {(formData.applyButtonText ||
                      formData.applyButtonTextMm) && (
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
                              formData.applyButtonText ||
                              formData.applyButtonTextMm
                            )
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a website URL (https://...) or email
                          (mailto:...) where users can apply
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-5">
                  <div className="space-y-3">
                    <Label>Course Images</Label>

                    {/* File Size Warning */}
                    {formData.images.length > 0 && (
                      <div
                        className={`p-3 rounded-md border ${
                          isOverLimit
                            ? "bg-red-50 border-red-200 text-red-800"
                            : isNearLimit
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <div className="text-sm">
                          <span className="font-medium">Total image size:</span>{" "}
                          {formatFileSize(totalFileSize)} of 4MB limit
                          {isOverLimit && (
                            <div className="mt-1 text-xs">
                              ⚠️ Size exceeds upload limit. Please remove some
                              images.
                            </div>
                          )}
                          {isNearLimit && !isOverLimit && (
                            <div className="mt-1 text-xs">
                              ⚠️ Approaching upload limit.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Display existing images */}
                      {existingImageList.map((url, index) => (
                        <div
                          key={`existing-image-${index}`}
                          className="relative h-40 border rounded-md overflow-hidden group"
                        >
                          <Image
                            src={url}
                            alt={`Existing course image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 256px"
                          />
                          <div className="absolute top-0 left-0 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-br-md">
                            Existing
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
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
                          className="relative h-40 border rounded-md overflow-hidden group"
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
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
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
                          disabled={isCompressing}
                        >
                          {isCompressing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            "Select Files"
                          )}
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
                                handleFaqChange(
                                  index,
                                  "question",
                                  e.target.value
                                )
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
                                handleFaqChange(
                                  index,
                                  "questionMm",
                                  e.target.value
                                )
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
                                handleFaqChange(
                                  index,
                                  "answerMm",
                                  e.target.value
                                )
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
                onClick={() => router.push(backUrl || "/org-admin")}
                disabled={isLoading}
                className={`${isMobile ? "w-full" : ""} hover:bg-gray-100`}
              >
                Cancel
              </Button>

              <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
                {draftMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={
                      isLoading ||
                      !formData.title ||
                      formData.title.trim() === ""
                    }
                    className={`${
                      isMobile ? "flex-1" : ""
                    } bg-gray-50 hover:bg-gray-100 border-gray-300`}
                  >
                    {isLoading ? "Saving..." : "Save Draft"}
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={(isSubmitting ?? isLoading) || isOverLimit}
                  className={`${
                    isMobile ? "flex-1" : ""
                  } bg-blue-600 hover:bg-blue-700 text-white`}
                >
                  {isSubmitting ?? isLoading
                    ? submitButtonText
                      ? "Saving..."
                      : draftMode
                      ? "Submitting..."
                      : "Saving..."
                    : isOverLimit
                    ? "Images too large"
                    : submitButtonText
                    ? submitButtonText
                    : draftMode
                    ? "Submit for Review"
                    : mode === "create"
                    ? "Create Course"
                    : "Update Course"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </TooltipProvider>
  );
}

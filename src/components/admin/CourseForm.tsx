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
  MapPin,
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
  titleMm: string; // Myanmar title
  subtitle: string;
  subtitleMm: string; // Myanmar subtitle
  location: string;
  locationMm: string; // Myanmar location
  startDate: string; // Will convert to DateTime when submitting
  startDateMm: string; // Will convert to DateTime when submitting
  endDate: string; // New field - will convert to DateTime when submitting
  endDateMm: string; // New field - will convert to DateTime when submitting
  duration: number; // Changed from string to number
  durationMm: number; // Changed from string to number
  schedule: string;
  scheduleMm: string; // Myanmar schedule
  feeAmount: number; // New field - numeric amount
  feeAmountMm: number; // New field - numeric amount
  ageMin: number; // New field - minimum age
  ageMinMm: number; // New field - minimum age (Myanmar)
  ageMax: number; // New field - maximum age
  ageMaxMm: number; // New field - maximum age (Myanmar)
  document: string; // New field - required document information
  documentMm: string; // New field - required document information (Myanmar)
  availableDays: boolean[];
  description: string;
  descriptionMm: string; // Myanmar description
  outcomes: string[];
  outcomesMm: string[]; // Myanmar outcomes
  scheduleDetails: string;
  scheduleDetailsMm: string; // Myanmar schedule details
  selectionCriteria: string[];
  selectionCriteriaMm: string[]; // Myanmar selection criteria
  organizationId?: string;
  images: File[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  faq: {
    question: string;
    questionMm: string; // Myanmar question
    answer: string;
    answerMm: string; // Myanmar answer
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
  { text: "Language", color: "#fff", backgroundColor: "#6e8efb" },
  { text: "In-Person", color: "#fff", backgroundColor: "#28a745" },
  { text: "Free", color: "#fff", backgroundColor: "#dc3545" },
  { text: "Vocational", color: "#fff", backgroundColor: "#6610f2" },
  { text: "Internship", color: "#fff", backgroundColor: "#fd7e14" },
  { text: "Technology", color: "#fff", backgroundColor: "#007bff" },
  { text: "Beginner", color: "#000", backgroundColor: "#ffc107" },
  { text: "Certification", color: "#fff", backgroundColor: "#17a2b8" },
];

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

  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title ?? "",
    titleMm: initialData?.titleMm ?? "",
    subtitle: initialData?.subtitle ?? "",
    subtitleMm: initialData?.subtitleMm ?? "",
    location: initialData?.location ?? "",
    locationMm: initialData?.locationMm ?? "",
    startDate: initialData?.startDate ?? "",
    startDateMm: initialData?.startDateMm ?? "",
    endDate: initialData?.endDate ?? "", // New field
    endDateMm: initialData?.endDateMm ?? "", // New field
    duration: initialData?.duration ?? 0, // Changed from string to number
    durationMm: initialData?.durationMm ?? 0, // Changed from string to number
    schedule: initialData?.schedule ?? "",
    scheduleMm: initialData?.scheduleMm ?? "",
    feeAmount: initialData?.feeAmount ?? 0, // New field
    feeAmountMm: initialData?.feeAmountMm ?? 0, // New field
    ageMin: initialData?.ageMin ?? 0, // New field
    ageMinMm: initialData?.ageMinMm ?? 0, // New field
    ageMax: initialData?.ageMax ?? 0, // New field
    ageMaxMm: initialData?.ageMaxMm ?? 0, // New field
    document: initialData?.document ?? "", // New field
    documentMm: initialData?.documentMm ?? "", // New field
    availableDays: initialData?.availableDays ?? [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    description: initialData?.description ?? "",
    descriptionMm: initialData?.descriptionMm ?? "",
    outcomes: initialData?.outcomes ?? [""],
    outcomesMm: initialData?.outcomesMm ?? [""],
    scheduleDetails: initialData?.scheduleDetails ?? "",
    scheduleDetailsMm: initialData?.scheduleDetailsMm ?? "",
    selectionCriteria: initialData?.selectionCriteria ?? [""],
    selectionCriteriaMm: initialData?.selectionCriteriaMm ?? [""],
    organizationId: organizationId ?? initialData?.organizationId ?? "",
    images: [],
    badges: initialData?.badges ?? [],
    faq: initialData?.faq ?? [
      {
        question: "",
        questionMm: "",
        answer: "",
        answerMm: "",
      },
    ],
  });

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
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
      | "selectionCriteriaMm",
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
      | "selectionCriteriaMm",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      const jsonData = {
        ...formData,
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
        mode === "create" ? "/api/courses" : `/api/courses/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/dashboard/courses");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error submitting course:", err);
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
                <Label htmlFor="organizationId">Organization</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={handleOrganizationChange}
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
                  <p className="text-xs text-muted-foreground">
                    No organizations found. Please create an organization first.
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

              {/* Location - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location ?? ""}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="locationMm"
                      name="locationMm"
                      value={formData.locationMm ?? ""}
                      onChange={handleTextChange}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Age Requirements - English and Myanmar (NEW) */}
              <div className="space-y-2">
                <Label htmlFor="ageMin">
                  <Users className="h-4 w-4 inline mr-1" />
                  Age Requirements
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English - Minimum Age
                    </div>
                    <Input
                      id="ageMin"
                      name="ageMin"
                      type="number"
                      min="0"
                      value={formData.ageMin}
                      onChange={(e) => handleNumberChange(e, "ageMin")}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar - Minimum Age
                    </div>
                    <Input
                      id="ageMinMm"
                      name="ageMinMm"
                      type="number"
                      min="0"
                      value={formData.ageMinMm}
                      onChange={(e) => handleNumberChange(e, "ageMinMm")}
                      dir="auto"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English - Maximum Age
                    </div>
                    <Input
                      id="ageMax"
                      name="ageMax"
                      type="number"
                      min="0"
                      value={formData.ageMax}
                      onChange={(e) => handleNumberChange(e, "ageMax")}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar - Maximum Age
                    </div>
                    <Input
                      id="ageMaxMm"
                      name="ageMaxMm"
                      type="number"
                      min="0"
                      value={formData.ageMaxMm}
                      onChange={(e) => handleNumberChange(e, "ageMaxMm")}
                      dir="auto"
                    />
                  </div>
                </div>
              </div>

              {/* Required Documents - English and Myanmar (NEW) */}
              <div className="space-y-2">
                <Label htmlFor="document">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Required Documents
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
                      placeholder="e.g. ID card, passport photos, etc."
                      required
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
              {/* Start Date - English and Myanmar */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate ?? ""}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="startDateMm"
                      name="startDateMm"
                      type="date"
                      value={formData.startDateMm ?? ""}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>
              </div>

              {/* End Date - English and Myanmar (NEW) */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  End Date
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate ?? ""}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="endDateMm"
                      name="endDateMm"
                      type="date"
                      value={formData.endDateMm ?? ""}
                      onChange={handleTextChange}
                    />
                  </div>
                </div>
              </div>

              {/* Duration - English and Myanmar (CHANGED to number) */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Duration (days)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
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
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="durationMm"
                      name="durationMm"
                      type="number"
                      min="1"
                      value={formData.durationMm}
                      onChange={(e) => handleNumberChange(e, "durationMm")}
                      placeholder="Number of days (Myanmar)"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Amount - English and Myanmar (NEW) */}
              <div className="space-y-2">
                <Label htmlFor="feeAmount">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Course Fee (THB)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      English
                    </div>
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
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Myanmar
                    </div>
                    <Input
                      id="feeAmountMm"
                      name="feeAmountMm"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.feeAmountMm}
                      onChange={(e) => handleNumberChange(e, "feeAmountMm")}
                      placeholder="Myanmar fee amount..."
                    />
                  </div>
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
            disabled={isLoading || !formData.organizationId}
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

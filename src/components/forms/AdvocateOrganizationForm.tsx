"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Building, Info } from "lucide-react";
import { compressImage, validateImageFile } from "@/lib/imageCompression";
import LocationSelector from "@/components/forms/LocationSelector";

interface OrganizationFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address?: string;
  facebookPage?: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  logoImage?: File;
}

interface AdvocateOrganizationFormProps {
  initialData?: Partial<OrganizationFormData>;
  mode?: "create" | "edit";
  editDraftId?: string;
  backUrl?: string;
}

export default function AdvocateOrganizationForm({
  initialData,
  mode = "create",
  editDraftId,
  backUrl = "/advocate",
}: AdvocateOrganizationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    facebookPage: initialData?.facebookPage || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    logoImage: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploadingLogo(true);

    try {
      const compressionResult = await compressImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
        maxSizeKB: 200,
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(compressionResult.file);

      setFormData((prev) => ({ ...prev, logoImage: compressionResult.file }));
    } catch (error) {
      setUploadError("Failed to process logo. Please try again.");
      console.error("Logo upload error:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logoImage: undefined }));
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const MAX_DESCRIPTION_WORDS = 200;

  const validateForm = () => {
    if (!formData.name.trim()) return "Organization name is required";
    if (!formData.description.trim()) return "Description is required";

    const wordCount = getWordCount(formData.description);
    if (wordCount > MAX_DESCRIPTION_WORDS) {
      return `Description must be ${MAX_DESCRIPTION_WORDS} words or less (currently ${wordCount} words)`;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (asDraft = false) => {
    const validationError = validateForm();
    if (!asDraft && validationError) {
      setError(validationError);
      return;
    }

    if (asDraft && !formData.name.trim()) {
      setError("Organization name is required to save draft");
      return;
    }

    if (asDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }
    setError(null);

    try {
      const draftData = {
        title: formData.name,
        type: "ORGANIZATION",
        content: formData,
        status: asDraft ? "DRAFT" : "PENDING",
      };

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(draftData));

      if (formData.logoImage) {
        formDataToSend.append("logoImage", formData.logoImage);
      }

      const url = editDraftId ? `/api/drafts/${editDraftId}` : "/api/drafts";
      const method = editDraftId ? "PATCH" : "POST";

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

      if (asDraft) {
        alert(
          "Draft saved successfully! You can continue editing or submit it later for review."
        );
      } else {
        const successParam = editDraftId ? "updated=true" : "submitted=true";
        router.push(`${backUrl}?${successParam}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Error submitting organization:", err);
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building className="h-8 w-8" />
          {mode === "edit"
            ? "Edit Organization Draft"
            : "Submit New Organization"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Submit a new organization for review by platform administrators. Once
          approved, it will be available for course creation.
        </p>
      </div>

      <Alert className="bg-white">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Review Process:</strong> All organization submissions are
          reviewed by platform administrators before being approved. You can
          save as draft to continue editing later, or submit for immediate
          review.
        </AlertDescription>
      </Alert>

      <Card className="bg-white">
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 bg-white">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter organization name"
              className={
                !formData.name.trim()
                  ? "border-red-200 focus:border-red-500"
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what the organization does, its mission, and the types of programs it offers..."
              rows={4}
              className={
                !formData.description.trim() ||
                getWordCount(formData.description) > MAX_DESCRIPTION_WORDS
                  ? "border-red-200 focus:border-red-500"
                  : ""
              }
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Provide a clear description that helps youth understand what
                your organization offers.
              </p>
              <p
                className={`text-xs ${
                  getWordCount(formData.description) > MAX_DESCRIPTION_WORDS
                    ? "text-red-600"
                    : getWordCount(formData.description) >
                      MAX_DESCRIPTION_WORDS * 0.8
                    ? "text-yellow-600"
                    : "text-muted-foreground"
                }`}
              >
                {getWordCount(formData.description)}/{MAX_DESCRIPTION_WORDS}{" "}
                words
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPage" className="text-sm font-medium">
              Facebook Page
            </Label>
            <Input
              id="facebookPage"
              name="facebookPage"
              type="url"
              value={formData.facebookPage}
              onChange={handleInputChange}
              placeholder="https://facebook.com/yourorganization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+66 XX XXX XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@organization.org"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Physical Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter the full address where the organization is located..."
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              Include street address, city, and any landmark information that
              helps people find the location.
            </p>
          </div>

          <LocationSelector
            value={{
              province: formData.province,
              district: formData.district,
            }}
            onChange={handleLocationChange}
            disabled={isSubmitting || isSavingDraft}
            key={`${formData.province}-${formData.district}`}
            className="hover:bg-gray-50"
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Organization Logo</Label>

            <div className="w-48 h-32 border rounded-lg bg-gray-50 flex items-center justify-center p-2 relative">
              {logoPreview ? (
                <>
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                    sizes="192px"
                  />
                  <Button
                    onClick={handleRemoveLogo}
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload logo</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                size="sm"
                className="hover:bg-gray-50"
              >
                {isUploadingLogo
                  ? "Processing..."
                  : logoPreview
                  ? "Change Logo"
                  : "Upload Logo"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP. Max size: 50MB (will be
              compressed automatically)
            </p>

            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between bg-white rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backUrl)}
            disabled={isSubmitting || isSavingDraft}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || isSavingDraft || !formData.name.trim()}
              className="bg-gray-50 hover:bg-gray-100 border-gray-300"
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || isSavingDraft}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

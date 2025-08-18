// src/components/admin/OrganizationForm.tsx

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { compressImage, validateImageFile } from "@/lib/imageCompression";
import LocationSelector from "@/components/forms/LocationSelector";

interface AdminOrganizationFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebookPage?: string;
    latitude: number;
    longitude: number;
    district?: string;
    province?: string;
    logoImage?: string;
  };
  mode: "create" | "edit";
}

export default function AdminOrganizationForm({
  initialData,
  mode,
}: AdminOrganizationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [existingLogo, setExistingLogo] = useState<string | null>(
    initialData?.logoImage || null
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    facebookPage: initialData?.facebookPage || "",
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    district: initialData?.district || "",
    province: initialData?.province || "",
    logoImage: undefined as File | undefined,
  });

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const MAX_DESCRIPTION_WORDS = 200;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (locationData: { province: string; district: string }) => {
    setFormData(prev => ({
      ...prev,
      province: locationData.province,
      district: locationData.district
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        maxSizeKB: 200
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(compressionResult.file);

      // Store compressed file for form submission
      setFormData(prev => ({ ...prev, logoImage: compressionResult.file }));
    } catch (error) {
      setUploadError("Failed to process logo. Please try again.");
      console.error("Logo upload error:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setFormData(prev => ({ ...prev, logoImage: undefined }));
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Form data before submission:", formData);
      console.log("Latitude (type):", typeof formData.latitude);
      console.log("Longitude (type):", typeof formData.longitude);

      // Determine if we need to use FormData (for file upload) or JSON
      const hasFileUpload = formData.logoImage !== undefined;

      if (hasFileUpload) {
        // Use FormData for file upload
        const formDataToSend = new FormData();

        // Add organization data
        const organizationData = {
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          facebookPage: formData.facebookPage,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          district: formData.district,
          province: formData.province,
        };

        formDataToSend.append("data", JSON.stringify(organizationData));

        // Add logo image
        if (formData.logoImage) {
          formDataToSend.append("logoImage", formData.logoImage);
        }

        const url =
          mode === "create"
            ? "/api/organizations"
            : `/api/organizations/${initialData?.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        const response = await fetch(url, {
          method,
          body: formDataToSend, // Use FormData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              errorData.details ||
              "Failed to save organization"
          );
        }
      } else {
        // Use JSON for non-file requests (backward compatibility)
        const dataToSubmit = {
          ...formData,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        };

        console.log("Data to submit:", dataToSubmit);

        const url =
          mode === "create"
            ? "/api/organizations"
            : `/api/organizations/${initialData?.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);

          // Better error handling for Zod validation errors
          if (errorData.details && typeof errorData.details === "object") {
            const fieldErrors: string[] = [];

            // Extract field errors from the nested Zod format
            for (const [field, error] of Object.entries(errorData.details)) {
              // Type guard to check if it's an array with _errors property
              if (
                field === "_errors" &&
                Array.isArray(error) &&
                error.length > 0
              ) {
                fieldErrors.push(error.join(", "));
              } else if (error !== null && typeof error === "object") {
                // Create a more specific type for Zod errors
                type ZodErrorObject = { _errors?: string[] };
                const zodError = error as ZodErrorObject;

                if (zodError._errors && Array.isArray(zodError._errors)) {
                  fieldErrors.push(`${field}: ${zodError._errors.join(", ")}`);
                }
              }
            }

            if (fieldErrors.length > 0) {
              throw new Error(fieldErrors.join("; "));
            }
          }

          throw new Error(
            errorData.error ||
              errorData.details ||
              "Failed to save organization"
          );
        }
      }

      router.push("/admin/organizations");
      router.refresh();
    } catch (err) {
      console.error("Error in organization submission:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-white">
      <CardHeader className="bg-white rounded-t-lg">
        <CardTitle>
          {mode === "create" ? "Create Organization" : "Edit Organization"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 bg-white">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={!formData.name.trim() ? "border-red-200 focus:border-red-500" : ""}
              required
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
              onChange={handleChange}
              rows={4}
              className={!formData.description.trim() || getWordCount(formData.description) > MAX_DESCRIPTION_WORDS ? "border-red-200 focus:border-red-500" : ""}
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Provide a clear description that helps youth understand what your organization offers.
              </p>
              <p className={`text-xs ${
                getWordCount(formData.description) > MAX_DESCRIPTION_WORDS 
                  ? "text-red-600" 
                  : getWordCount(formData.description) > MAX_DESCRIPTION_WORDS * 0.8 
                    ? "text-yellow-600" 
                    : "text-muted-foreground"
              }`}>
                {getWordCount(formData.description)}/{MAX_DESCRIPTION_WORDS} words
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPage" className="text-sm font-medium">Facebook Page</Label>
            <Input
              id="facebookPage"
              name="facebookPage"
              type="url"
              value={formData.facebookPage}
              onChange={handleChange}
              placeholder="https://facebook.com/yourorganization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Physical Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter the full address where the organization is located..."
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              Include street address, city, and any landmark information that helps people find the location.
            </p>
          </div>

          <LocationSelector
            value={{
              province: formData.province,
              district: formData.district
            }}
            onChange={handleLocationChange}
            disabled={isLoading}
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
              ) : existingLogo ? (
                <>
                  <Image 
                    src={existingLogo} 
                    alt="Current logo" 
                    fill
                    className="object-contain"
                    sizes="192px"
                  />
                  <Button
                    onClick={() => setExistingLogo(null)}
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
                  <p className="text-sm text-muted-foreground">
                    Upload logo
                  </p>
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
                {isUploadingLogo ? "Processing..." : logoPreview || existingLogo ? "Change Logo" : "Upload Logo"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP. Max size: 50MB (will be compressed automatically)
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
            onClick={() => router.back()}
            disabled={isLoading}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

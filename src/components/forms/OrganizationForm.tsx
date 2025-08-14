// src/components/admin/OrganizationForm.tsx

"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react"; // ADD THIS IMPORT
import Image from "next/image"; // ADD THIS IMPORT

interface OrganizationFormProps {
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

export default function OrganizationForm({
  initialData,
  mode,
}: OrganizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const hasFileUpload = logoImage !== null;

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
        if (logoImage) {
          formDataToSend.append("logoImage", logoImage);
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
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Organization" : "Edit Organization"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Organization address (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPage">Facebook Page (Optional)</Label>
            <Input
              id="facebookPage"
              name="facebookPage"
              value={formData.facebookPage}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoImage">Organization Logo (Optional)</Label>

            {existingLogo && !logoImage && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Current Logo:
                </p>
                <div className="relative inline-block">
                  <Image
                    src={existingLogo}
                    alt="Current organization logo"
                    width={128}
                    height={128}
                    className="object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => setExistingLogo(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {logoImage && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  New Logo Preview:
                </p>
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(logoImage)}
                    alt="New organization logo"
                    width={128}
                    height={128}
                    className="object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => setLogoImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Input
              id="logoImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setLogoImage(e.target.files?.[0] || null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or WebP format recommended
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
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

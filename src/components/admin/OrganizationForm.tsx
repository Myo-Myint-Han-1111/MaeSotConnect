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
    district?: string; // Added new field
    province?: string; // Added new field
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

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    facebookPage: initialData?.facebookPage || "",
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    district: initialData?.district || "", // Added new field
    province: initialData?.province || "", // Added new field
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

  // Specialized handler for number fields
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Add more detailed logging
      console.log("Form data before submission:", formData);
      console.log("Latitude (type):", typeof formData.latitude);
      console.log("Longitude (type):", typeof formData.longitude);

      // Ensure latitude and longitude are numbers
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
          errorData.error || errorData.details || "Failed to save organization"
        );
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
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* New fields for district and province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Province (optional)"
              />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="text" // Changed from number to text for better handling
                value={formData.latitude}
                onChange={(e) => handleNumberChange(e, "latitude")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="text" // Changed from number to text for better handling
                value={formData.longitude}
                onChange={(e) => handleNumberChange(e, "longitude")}
                required
              />
            </div>
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

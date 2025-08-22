"use client";

// components/org-admin/OrganizationProfileForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, MapPin, Phone, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import LocationSelector from "@/components/forms/LocationSelector";

interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address?: string | null;
  facebookPage?: string | null;
  latitude: number;
  longitude: number;
  district?: string | null;
  province?: string | null;
  logoImage?: string | null;
  slug: string;
}

interface OrganizationProfileFormProps {
  organization: Organization;
}

export default function OrganizationProfileForm({
  organization,
}: OrganizationProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description,
    phone: organization.phone,
    email: organization.email,
    address: organization.address || "",
    facebookPage: organization.facebookPage || "",
    latitude: organization.latitude,
    longitude: organization.longitude,
    district: organization.district || "",
    province: organization.province || "",
    logoImage: organization.logoImage || "",
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Added proper location change handler for LocationSelector
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
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/org-admin/profile/${organization.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update organization");
      }

      // SUCCESS - Redirect immediately to profile page
      router.push("/org-admin/profile");
    } catch (error) {
      console.error("Error updating organization:", error);

      if (error instanceof Error) {
        // Try to parse API validation errors
        try {
          // If it's a fetch error, try to get more details
          if (error.message.includes("Failed to update organization")) {
            setError("Please check all required fields and try again.");
          } else {
            setError(error.message);
          }
        } catch {
          setError(error.message);
        }
      } else {
        setError("Failed to update organization profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <h4 className="font-medium text-red-800 mb-1">Error:</h4>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="logoImage">Logo Image URL</Label>
                <Input
                  id="logoImage"
                  value={formData.logoImage}
                  onChange={(e) =>
                    handleInputChange("logoImage", e.target.value)
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your organization's mission and activities"
                rows={4}
                required
              />
            </div>

            {/* Logo Preview */}
            {formData.logoImage && (
              <div>
                <Label>Logo Preview</Label>
                <div className="mt-2 w-32 h-32 border rounded-lg bg-gray-50 flex items-center justify-center p-2 relative overflow-hidden">
                  <Image
                    src={formData.logoImage}
                    alt="Organization logo"
                    fill
                    className="object-contain"
                    sizes="128px"
                    onError={() => handleInputChange("logoImage", "")}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+66 x xxxx xxxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@organization.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facebookPage">Facebook Page</Label>
              <Input
                id="facebookPage"
                value={formData.facebookPage}
                onChange={(e) =>
                  handleInputChange("facebookPage", e.target.value)
                }
                placeholder="https://facebook.com/yourorganization"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ✅ Replaced hardcoded Myanmar provinces with proper LocationSelector */}
            <LocationSelector
              value={{
                province: formData.province,
                district: formData.district,
              }}
              onChange={handleLocationChange}
              disabled={loading}
              key={`${formData.province}-${formData.district}`}
              className="hover:bg-gray-50"
            />

            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange(
                      "latitude",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="13.7563" // ✅ Updated to Thailand coordinates
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleInputChange(
                      "longitude",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="100.5018" // ✅ Updated to Thailand coordinates
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="h-4 w-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

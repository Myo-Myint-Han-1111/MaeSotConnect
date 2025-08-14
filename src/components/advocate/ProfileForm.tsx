"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Shield, Info } from "lucide-react";
import AvatarPicker from "./AvatarPicker";

interface ProfileFormData {
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  showOrganization: boolean;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  mode?: "create" | "edit";
  profileId?: string;
}

export default function ProfileForm({ initialData, mode = "create", profileId }: ProfileFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    publicName: initialData?.publicName || "",
    bio: initialData?.bio || "",
    avatarUrl: initialData?.avatarUrl || "",
    showOrganization: initialData?.showOrganization || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (asDraft = false) => {
    if (asDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }
    setError(null);

    try {
      const endpoint = mode === "edit" && profileId 
        ? `/api/advocate/profile/${profileId}`
        : "/api/advocate/profile";
      
      const method = mode === "edit" ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: asDraft ? "DRAFT" : "PENDING"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      router.push("/advocate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "edit" ? "Edit Profile" : "Create Public Profile"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a public profile to showcase your advocacy work and connect with the community.
        </p>
      </div>

      <Alert className="bg-white border border-gray-200 rounded-lg">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy &amp; Safety:</strong> Your profile is completely optional. You can use an alias instead of your real name, 
          and choose whether to display your organization. All profiles are reviewed by admins before going public.
        </AlertDescription>
      </Alert>

      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be displayed on your public profile page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-white rounded-b-lg">
          <div className="space-y-2">
            <Label htmlFor="publicName">
              Public Display Name 
              <span className="text-muted-foreground text-sm ml-2">(Optional - can be an alias)</span>
            </Label>
            <Input
              id="publicName"
              value={formData.publicName}
              onChange={(e) => handleInputChange("publicName", e.target.value)}
              placeholder="Enter your public name or alias"
              className="bg-white"
            />
            <p className="text-sm text-muted-foreground">
              Leave blank to display as &ldquo;Anonymous Youth Advocate&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio 
              <span className="text-muted-foreground text-sm ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell the community about your advocacy work, interests, or goals..."
              rows={4}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Avatar 
              <span className="text-muted-foreground text-sm ml-2">(Optional)</span>
            </Label>
            <AvatarPicker
              value={formData.avatarUrl}
              onChange={(avatarUrl) => handleInputChange("avatarUrl", avatarUrl)}
              seed={formData.publicName || "anonymous-user"}
            />
          </div>

          <div className="flex items-start space-x-2 p-4 bg-white border rounded-lg">
            <input
              type="checkbox"
              id="showOrganization"
              checked={formData.showOrganization}
              onChange={(e) => handleInputChange("showOrganization", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="showOrganization" className="text-sm font-medium">
                Display my organization
              </Label>
              <p className="text-xs text-muted-foreground">
                Show your organization name on your public profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-white border border-gray-200 rounded-lg">
        <Info className="h-4 w-4" />
        <AlertDescription>
          After submission, your profile will be reviewed by platform administrators before appearing publicly. 
          You can save as draft to continue editing later.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/advocate")}
          disabled={isSubmitting || isSavingDraft}
        >
          Cancel
        </Button>
        
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || isSavingDraft}
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
          
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || isSavingDraft}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
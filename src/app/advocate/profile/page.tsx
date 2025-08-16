"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/advocate/ProfileForm";

type ProfileData = {
  id: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  showOrganization: boolean;
  status: string;
} | null;

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const [profileData, setProfileData] = useState<ProfileData>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await fetch("/api/advocate/profile", {
        cache: 'no-store'
      });
      if (response.ok) {
        const profile = await response.json();
        setProfileData(profile);
      } else if (response.status === 404) {
        // No profile exists yet
        setProfileData(null);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "YOUTH_ADVOCATE") {
      fetchProfileData();
    }
  }, [session, fetchProfileData]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only youth advocates can access this page
  if (session?.user?.role !== "YOUTH_ADVOCATE") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a youth advocate to manage your profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ProfileForm
        mode={profileData ? "edit" : "create"}
        initialData={profileData || undefined}
        profileId={profileData?.id}
      />
    </div>
  );
}
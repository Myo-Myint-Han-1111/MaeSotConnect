"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { User, Mail, Building2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  organization?: {
    name: string;
  };
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${session.user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserProfile(data);
        setName(data.name || "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setUpdateSuccess(false);

    // Validate passwords if user is trying to change it
    if (newPassword) {
      if (newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }

      if (!currentPassword) {
        setPasswordError("Current password is required to set a new password");
        return;
      }
    }

    try {
      const response = await fetch(
        `/api/users/${session?.user?.id}/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUpdateSuccess(true);

      // Update the session to reflect name changes
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          name,
        });
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 rounded-md bg-red-50 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="h-24 w-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {userProfile?.name?.charAt(0) || "U"}
            </div> */}

            <div className="pt-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Name</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {userProfile?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>

              {userProfile?.organization && (
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {userProfile.organization.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Organization
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Update Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              {updateSuccess && (
                <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                  Profile updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="border-t my-6"></div>

              <h3 className="text-lg font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Leave these fields blank if you do not want to change your
                password
              </p>

              {passwordError && (
                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit">Update Profile</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

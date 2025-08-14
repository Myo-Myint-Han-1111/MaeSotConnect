"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, CheckCircle, XCircle, Clock, FileText, Shield, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

type ProfileStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

interface Profile {
  id: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  showOrganization: boolean;
  status: ProfileStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    organization?: {
      name: string;
    };
  };
  reviewedByUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  HIDDEN: { label: "Hidden", color: "bg-gray-100 text-gray-800", icon: EyeOff },
};

export default function ProfileReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setReviewNotes(data.reviewNotes || "");
      } else {
        console.error("Failed to fetch profile");
        setError("Profile not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!profile) return;
    
    setIsReviewing(true);
    setError(null);

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes.trim() || null,
        }),
      });

      if (response.ok) {
        router.push("/admin/profiles");
      } else {
        throw new Error("Failed to review profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleToggleHide = async () => {
    if (!profile) return;
    
    const isCurrentlyHidden = profile.status === "HIDDEN";
    const newStatus = isCurrentlyHidden ? "APPROVED" : "HIDDEN";
    const confirmMessage = isCurrentlyHidden 
      ? "Unhide this profile and make it visible to the public again?" 
      : "Hide this profile from public view?";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: null,
        }),
      });

      if (response.ok) {
        await fetchProfile();
      } else {
        throw new Error(`Failed to ${isCurrentlyHidden ? 'unhide' : 'hide'} profile`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    
    if (!confirm("Delete this profile permanently? This action cannot be undone and will remove all profile data including the avatar.")) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/profiles");
      } else {
        throw new Error("Failed to delete profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground mb-4">{error || "The requested profile could not be found."}</p>
        <Link href="/admin/profiles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile Reviews
          </Button>
        </Link>
      </div>
    );
  }

  // Only platform admins can access this page
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a platform administrator to review profiles.
        </p>
      </div>
    );
  }

  const StatusIcon = statusConfig[profile.status].icon;
  const canReview = profile.status === "PENDING";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <div>
        <Link href="/admin/profiles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Review</h1>
        <p className="text-muted-foreground mt-2">
          Review Youth Advocate public profile submission
        </p>
      </div>

      {/* Profile Preview */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">Profile Preview</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig[profile.status].color} flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[profile.status].label}
              </Badge>
              {/* Admin Action Buttons */}
              {session?.user?.role === "PLATFORM_ADMIN" && (profile.status === "APPROVED" || profile.status === "HIDDEN") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleHide}
                  disabled={isProcessing}
                  className="hover:bg-yellow-50 hover:text-yellow-700"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  {profile.status === "HIDDEN" ? "Unhide" : "Hide"}
                </Button>
              )}
              {session?.user?.role === "PLATFORM_ADMIN" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            This is how the profile will appear to the public if approved
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 bg-white rounded-b-lg">
          {/* Public Profile Display */}
          <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl || undefined} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  {profile.publicName || "Anonymous Youth Advocate"}
                </h3>
                
                {profile.showOrganization && profile.user.organization && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {profile.user.organization.name}
                  </p>
                )}
                
                {profile.bio && (
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                )}
                
                {!profile.bio && (
                  <p className="text-sm text-muted-foreground italic">
                    No bio provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Submitted by</Label>
              <p className="text-sm">{profile.user.name} ({profile.user.email})</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
              <p className="text-sm">{profile.user.organization?.name || "No organization"}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
              <p className="text-sm">{profile.submittedAt ? new Date(profile.submittedAt).toLocaleString() : "Not submitted"}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Show Organization Publicly</Label>
              <p className="text-sm">{profile.showOrganization ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* Previous Review */}
          {profile.reviewedAt && profile.reviewedByUser && (
            <Alert className="bg-white border border-gray-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Previously reviewed by:</strong> {profile.reviewedByUser.name} on {new Date(profile.reviewedAt).toLocaleString()}</p>
                  {profile.reviewNotes && (
                    <div>
                      <p className="font-medium">Previous review notes:</p>
                      <p className="text-sm">{profile.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review Section */}
      {canReview && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="bg-white rounded-t-lg">
            <CardTitle>Review & Decision</CardTitle>
            <CardDescription>
              Approve or reject this profile submission with optional feedback
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 bg-white rounded-b-lg">
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Provide feedback to the user about their profile submission..."
                rows={4}
                className="bg-white"
              />
            </div>

            <Alert className="bg-white border border-gray-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Review Guidelines:</strong> Ensure the profile content is appropriate for public display and follows community guidelines. Consider privacy and safety aspects.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => handleReview("REJECTED")}
                disabled={isReviewing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              
              <Button
                onClick={() => handleReview("APPROVED")}
                disabled={isReviewing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isReviewing ? "Approving..." : "Approve"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!canReview && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="py-6 bg-white rounded-lg">
            <div className="text-center">
              <StatusIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {profile.status === "APPROVED" ? "Profile Approved" : 
                 profile.status === "REJECTED" ? "Profile Rejected" : 
                 profile.status === "HIDDEN" ? "Profile Hidden" : "Profile is Draft"}
              </h3>
              <p className="text-muted-foreground">
                {profile.status === "APPROVED" ? "This profile has been approved and is publicly visible." :
                 profile.status === "REJECTED" ? "This profile has been rejected and is not publicly visible." :
                 profile.status === "HIDDEN" ? "This profile is hidden from public view." :
                 "This profile is still in draft status and hasn't been submitted for review."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, Plus, Edit, Undo2, Trash2, Copy, User, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DraftStatus } from "@/lib/auth/roles";

type DraftSummary = {
  id: string;
  title: string;
  type: string;
  content: Record<string, unknown>;
  status: DraftStatus;
  submittedAt: string;
  reviewedAt?: string;
};

type ProfileSummary = {
  id: string;
  publicName?: string;
  avatarUrl?: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
};

export default function AdvocateDashboard() {
  const { data: session } = useSession();
  const [recentDrafts, setRecentDrafts] = useState<DraftSummary[]>([]);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchDrafts();
    fetchProfile();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      if (response.ok) {
        const drafts = await response.json();
        setRecentDrafts(drafts.slice(0, 5)); // Show last 5 drafts
        
        // Calculate stats
        const stats = drafts.reduce(
          (acc: { total: number; pending: number; approved: number; rejected: number }, draft: DraftSummary) => {
            acc.total++;
            switch (draft.status) {
              case DraftStatus.PENDING:
                acc.pending++;
                break;
              case DraftStatus.APPROVED:
                acc.approved++;
                break;
              case DraftStatus.REJECTED:
                acc.rejected++;
                break;
            }
            return acc;
          },
          { total: 0, pending: 0, approved: 0, rejected: 0 }
        );
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/advocate/profile");
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else if (response.status !== 404) {
        console.error("Error fetching profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleWithdraw = async (draftId: string) => {
    if (isProcessing) return;
    
    if (!confirm("Withdraw this draft from review? You can edit and resubmit it later.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "DRAFT"
        }),
      });

      if (response.ok) {
        // Refresh the drafts
        await fetchDrafts();
      } else {
        alert("Error withdrawing draft. Please try again.");
      }
    } catch (error) {
      console.error("Error withdrawing draft:", error);
      alert("Error withdrawing draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (draftId: string, draftTitle: string) => {
    if (isProcessing) return;
    
    if (!confirm(`Delete "${draftTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the drafts
        await fetchDrafts();
      } else {
        const error = await response.json();
        alert(`Error deleting draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error deleting draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async (draftId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}/copy`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the drafts to show the new copy
        await fetchDrafts();
        alert(`Draft copied successfully as "${result.draft.title}"`);
      } else {
        const error = await response.json();
        alert(`Error copying draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error copying draft:", error);
      alert("Error copying draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleHideProfile = async () => {
    if (isProcessing || !profile) return;
    
    const isCurrentlyHidden = profile.status === "HIDDEN";
    const newStatus = isCurrentlyHidden ? "APPROVED" : "HIDDEN";
    const confirmMessage = isCurrentlyHidden 
      ? "Unhide your profile and make it visible to the public again?" 
      : "Hide your profile from public view? You can unhide it later.";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/advocate/profile/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        await fetchProfile();
      } else {
        alert(`Error ${isCurrentlyHidden ? 'unhiding' : 'hiding'} profile. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${isCurrentlyHidden ? 'unhiding' : 'hiding'} profile:`, error);
      alert(`Error ${isCurrentlyHidden ? 'unhiding' : 'hiding'} profile. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (isProcessing || !profile) return;
    
    if (!confirm("Delete your profile permanently? This action cannot be undone and you'll lose all your profile data including your avatar.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/advocate/profile/${profile.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProfile(null);
      } else {
        const error = await response.json();
        alert(`Error deleting profile: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Error deleting profile. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadgeColor = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.DRAFT:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case DraftStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case DraftStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case DraftStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case DraftStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        {profile?.avatarUrl && (
          <div className="flex-shrink-0">
            <Image
              src={profile.avatarUrl}
              alt="Profile Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-2 border-gray-200 shadow-sm"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Submit course drafts and track their approval status.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild className="bg-blue-700 hover:bg-blue-600 text-white">
          <Link href="/advocate/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit New Course
          </Link>
        </Button>
        <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-700">
          <Link href="/advocate/drafts">
            <FileText className="mr-2 h-4 w-4" />
            View All Drafts
          </Link>
        </Button>
        <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-700">
          <Link href="/advocate/profile">
            <User className="mr-2 h-4 w-4" />
            {profile ? "Manage Profile" : "Create Profile"}
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white rounded-t-lg">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white rounded-t-lg">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white rounded-t-lg">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white rounded-t-lg">
            <CardTitle className="text-sm font-medium">Needs Revision</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Your latest course submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white rounded-b-lg">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentDrafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven&apos;t submitted any courses yet.</p>
                <Button asChild>
                  <Link href="/advocate/submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your First Course
                  </Link>
                </Button>
              </div>
            ) : (
              recentDrafts.map((draft) => {
                const content = draft.content as { imageUrls?: string[]; subtitle?: string; description?: string };
                const firstImage = content?.imageUrls?.[0];
                const subtitle = content?.subtitle || content?.description;
                return (
                <div
                  key={draft.id}
                  className="max-w-md p-4 border border-gray-200 rounded-lg flex flex-col bg-white"
                >
                  {firstImage && (
                    <div className="mb-3">
                      <Image
                        src={firstImage}
                        alt={draft.title}
                        width={400}
                        height={128}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(draft.status)}
                      <Badge className={getStatusBadgeColor(draft.status)}>
                        {draft.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-1 line-clamp-2">{draft.title}</h3>
                    {subtitle && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {String(subtitle)}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Submitted: {new Date(draft.submittedAt).toLocaleDateString()}</p>
                      {draft.reviewedAt && (
                        <p>Reviewed: {new Date(draft.reviewedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {/* Primary Edit Actions */}
                    {draft.status === "DRAFT" && (
                      <Button 
                        size="sm" 
                        asChild
                        className="hover:bg-blue-700 hover:text-white"
                      >
                        <Link href={`/advocate/submit?edit=${draft.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    {draft.status === "REJECTED" && (
                      <Button 
                        size="sm" 
                        asChild
                        className="hover:bg-blue-700 hover:text-white"
                      >
                        <Link href={`/advocate/submit?edit=${draft.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Revise
                        </Link>
                      </Button>
                    )}
                    {draft.status === "PENDING" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-yellow-50 hover:text-yellow-700"
                        onClick={() => handleWithdraw(draft.id)}
                        disabled={isProcessing}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    )}
                    
                    {/* Copy Action - Available for all statuses */}
                    <Button 
                      size="sm" 
                      className="hover:bg-green-50 hover:text-green-700"
                      onClick={() => handleCopy(draft.id)}
                      disabled={isProcessing}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    {/* Delete Action - Only for non-approved drafts */}
                    {draft.status !== "APPROVED" && (
                      <Button 
                        size="sm" 
                        className="hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(draft.id, draft.title)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Secondary View Action */}
                    <Button variant="ghost" size="sm" className="hover:text-gray-500" asChild>
                      <Link href={`/advocate/drafts/${draft.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              )})
            )}
          </div>
          {recentDrafts.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/advocate/drafts">View All Submissions</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Status */}
      {profile && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="bg-white rounded-t-lg">
            <CardTitle>Public Profile Status</CardTitle>
            <CardDescription>
              Your public profile for community recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white rounded-b-lg">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center gap-4">
                {profile.avatarUrl && (
                  <Image
                    src={profile.avatarUrl}
                    alt="Profile Avatar"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border border-gray-200"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {profile.publicName || "Anonymous Profile"}
                    </span>
                    <Badge className={
                      profile.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      profile.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      profile.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      profile.status === "HIDDEN" ? "bg-gray-100 text-gray-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {profile.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile.status === "APPROVED" ? "Your profile is live and visible to the public" :
                     profile.status === "PENDING" ? "Your profile is awaiting admin review" :
                     profile.status === "REJECTED" ? "Your profile needs revision before it can go live" :
                     profile.status === "HIDDEN" ? "Your profile is hidden from public view" :
                     "Your profile is saved as a draft"}
                  </p>
                  {profile.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(profile.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/advocate/profile">
                    <Edit className="h-4 w-4 mr-1" />
                    {profile.status === "REJECTED" ? "Revise" : "Edit"}
                  </Link>
                </Button>
                {(profile.status === "APPROVED" || profile.status === "HIDDEN") && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToggleHideProfile}
                    disabled={isProcessing}
                    className="hover:bg-yellow-50 hover:text-yellow-700"
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    {profile.status === "HIDDEN" ? "Unhide" : "Hide"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteProfile}
                  disabled={isProcessing}
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
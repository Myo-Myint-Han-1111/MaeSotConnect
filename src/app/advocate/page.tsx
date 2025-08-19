"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, Plus, Edit, Undo2, Trash2, Copy, User, EyeOff, AlertTriangle, Building, BookOpen, CheckCircle2, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DraftStatus } from "@/lib/auth/roles";
import { Skeleton } from "@/components/ui/skeleton";

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

type ApprovedCourse = {
  id: string;
  title: string;
  organizationName?: string;
  isPublic: boolean;
  approvedAt: string;
};

export default function AdvocateDashboard() {
  const { data: session } = useSession();
  const [recentDrafts, setRecentDrafts] = useState<DraftSummary[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<ApprovedCourse[]>([]);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [rankData, setRankData] = useState<{
    rank: number | null;
    totalAdvocates: number;
    courseCount: number;
    hasProfile: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDrafts(),
          fetchProfile(),
          fetchRank(),
          fetchStats(),
          fetchApprovedCourses()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts", {
        cache: 'no-store'
      });
      if (response.ok) {
        const drafts = await response.json();
        setRecentDrafts(drafts.slice(0, 5)); // Show last 5 drafts
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/advocate/stats", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.totalSubmissions,
          pending: data.drafts.pending,
          approved: data.approvedCourses,
          rejected: data.drafts.rejected,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchApprovedCourses = async () => {
    try {
      const response = await fetch("/api/advocate/courses", {
        cache: 'no-store'
      });
      if (response.ok) {
        const courses = await response.json();
        setApprovedCourses(courses);
      }
    } catch (error) {
      console.error("Error fetching approved courses:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/advocate/profile", {
        cache: 'no-store'
      });
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

  const fetchRank = async () => {
    try {
      const response = await fetch("/api/advocate/rank", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setRankData(data);
      }
    } catch (error) {
      console.error("Error fetching rank:", error);
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
        // Refresh the drafts and stats
        await fetchDrafts();
        await fetchStats();
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
        // Refresh the drafts and stats
        await fetchDrafts();
        await fetchStats();
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
        // Refresh the drafts and stats to show the new copy
        await fetchDrafts();
        await fetchStats();
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


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {loading ? (
              <Skeleton className="w-24 h-24 rounded-full" />
            ) : profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile Avatar"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-80" />
                <Skeleton className="h-5 w-96" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, {session?.user?.name}!
                </h1>
                <p className="text-muted-foreground">
                  Submit course drafts, propose new organizations, and track their approval status.
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Rank Display */}
        {rankData === null ? (
          // Skeleton while loading
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="text-left space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : rankData.hasProfile && rankData.rank ? (
          // Actual rank display
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {rankData.rank <= 3 ? (
                  <span className="text-4xl">
                    {rankData.rank === 1 ? '🥇' : rankData.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-gray-500 font-bold text-3xl">#{rankData.rank}</span>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Rank {rankData.rank} of {rankData.totalAdvocates}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Youth Advocates
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
              <Link 
                href="/youthadvocates" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors whitespace-nowrap"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      {loading ? (
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      ) : (
        <div className="flex gap-4 flex-wrap">
          <Button asChild className="bg-blue-700 hover:bg-blue-600 text-white">
            <Link href="/advocate/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit New Course
            </Link>
          </Button>
          <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-500">
            <Link href="/advocate/organizations/submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Link>
          </Button>
          <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-500">
            <Link href="/advocate/drafts">
              <FileText className="mr-2 h-4 w-4" />
              View All Drafts
            </Link>
          </Button>
          <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-500">
            <Link href="/advocate/profile">
              <User className="mr-2 h-4 w-4" />
              {profile ? "Manage Profile" : "Create Profile"}
            </Link>
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white rounded-t-lg">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent className="bg-white rounded-b-lg">
                <Skeleton className="h-8 w-8" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
      )}

      {/* Recent Submissions */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Your latest course and organization submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white rounded-b-lg">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentDrafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No recent submissions to display.</p>
                <Button asChild>
                  <Link href="/advocate/submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit a Course
                  </Link>
                </Button>
              </div>
            ) : (
              recentDrafts.map((draft) => {
                const content = draft.content as { 
                  imageUrls?: string[]; 
                  subtitle?: string; 
                  description?: string;
                  logoImageUrl?: string;
                };
                const firstImage = draft.type === "ORGANIZATION" ? content?.logoImageUrl : content?.imageUrls?.[0];
                const subtitle = content?.subtitle || content?.description;
                return (
                <div
                  key={draft.id}
                  className="max-w-md p-4 border border-gray-200 rounded-lg flex flex-col bg-white"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {draft.type === "ORGANIZATION" ? (
                      <Building className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {draft.type === "ORGANIZATION" ? "Organization" : "Course"}
                    </span>
                  </div>
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
                        <Link href={draft.type === "ORGANIZATION" ? `/advocate/organizations/submit?edit=${draft.id}` : `/advocate/submit?edit=${draft.id}`}>
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
                        <Link href={draft.type === "ORGANIZATION" ? `/advocate/organizations/submit?edit=${draft.id}` : `/advocate/submit?edit=${draft.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Revise
                        </Link>
                      </Button>
                    )}
                    {draft.status === "PENDING" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-gray-50"
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
                      className="hover:text-gray-500"
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
              <Button variant="outline" asChild className="hover:bg-gray-50">
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
                <Button variant="outline" size="sm" asChild className="hover:bg-blue-600 hover:text-white">
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
                    className="hover:bg-gray-50"
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

      {/* Approved Courses */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle>Your Approved Courses</CardTitle>
          <CardDescription>
            Courses you&apos;ve submitted that are now live on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white rounded-b-lg">
          {approvedCourses.length > 0 ? (
            <div className="space-y-3">
              {approvedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      {course.organizationName && (
                        <p className="text-sm text-gray-600">{course.organizationName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className={course.isPublic ? "text-green-600" : "text-gray-400"}>
                        {course.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(course.approvedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No approved courses yet.</p>
              <p className="text-sm text-muted-foreground">
                Once your submitted courses are approved, they&apos;ll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import Link from "next/link";

type ProfileStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

interface Profile {
  id: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  showOrganization: boolean;
  status: ProfileStatus;
  submittedAt?: string;
  reviewedAt?: string;
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
}

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function ProfileReviewsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchProfiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.set("status", selectedStatus);
      }
      
      const response = await fetch(`/api/admin/profiles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
      } else {
        console.error("Failed to fetch profiles");
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
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

  const statusCounts = profiles.reduce((acc, profile) => {
    acc[profile.status] = (acc[profile.status] || 0) + 1;
    return acc;
  }, {} as Record<ProfileStatus, number>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve Youth Advocate public profiles.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          onClick={() => setSelectedStatus("all")}
          className="text-sm"
        >
          All ({profiles.length})
        </Button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            className="text-sm"
          >
            <config.icon className="h-4 w-4 mr-1" />
            {config.label} ({statusCounts[status as ProfileStatus] || 0})
          </Button>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => {
          const StatusIcon = statusConfig[profile.status].icon;
          
          return (
            <Card key={profile.id} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatarUrl || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {profile.publicName || "Anonymous Youth Advocate"}
                      </CardTitle>
                      <CardDescription>
                        {profile.user.name} ({profile.user.email})
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[profile.status].color} flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[profile.status].label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.bio}
                  </p>
                )}
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  {profile.showOrganization && profile.user.organization && (
                    <div>Organization: {profile.user.organization.name}</div>
                  )}
                  <div>Submitted: {profile.submittedAt ? new Date(profile.submittedAt).toLocaleDateString() : "Not submitted"}</div>
                  {profile.reviewedAt && (
                    <div>Reviewed: {new Date(profile.reviewedAt).toLocaleDateString()}</div>
                  )}
                </div>

                {profile.reviewNotes && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Review Notes:</p>
                    <p className="text-sm text-muted-foreground mt-1">{profile.reviewNotes}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Link href={`/admin/profiles/${profile.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No profiles found</h3>
          <p className="text-muted-foreground">
            {selectedStatus === "all" 
              ? "No Youth Advocate profiles have been created yet."
              : `No profiles with status "${statusConfig[selectedStatus as ProfileStatus]?.label}" found.`}
          </p>
        </div>
      )}
    </div>
  );
}
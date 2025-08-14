"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";

type Draft = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  author: {
    name: string;
    email: string;
  };
  organization?: {
    name: string;
  };
};

export default function AdminDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/admin/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      } else {
        setError("Failed to fetch drafts");
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
      setError("Error loading drafts");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = 
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getPendingCount = () => {
    return drafts.filter(draft => draft.status === DraftStatus.PENDING).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Drafts</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchDrafts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Draft Reviews</h1>
          <p className="text-muted-foreground">
            Review and manage course drafts submitted by Youth Advocates and Organization Admins.
          </p>
        </div>
        {getPendingCount() > 0 && (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            {getPendingCount()} Pending Review
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{drafts.filter(d => d.status === DraftStatus.PENDING).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{drafts.filter(d => d.status === DraftStatus.APPROVED).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold">{drafts.filter(d => d.status === DraftStatus.REJECTED).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{drafts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by course title or author name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={DraftStatus.PENDING}>Pending Review</SelectItem>
                <SelectItem value={DraftStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={DraftStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drafts List */}
      <div className="space-y-4">
        {filteredDrafts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {drafts.length === 0 ? (
                  <p className="text-muted-foreground">No course drafts have been submitted yet.</p>
                ) : (
                  <p className="text-muted-foreground">No drafts match your current filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDrafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(draft.status)}
                      <h3 className="text-lg font-medium">{draft.title}</h3>
                      <Badge className={getStatusBadgeColor(draft.status)}>
                        {draft.status === DraftStatus.REJECTED ? "Needs Revision" : draft.status}
                      </Badge>
                      {draft.status === DraftStatus.PENDING && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Needs Review
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Submitted by:</span> {draft.author.name} ({draft.author.email})</p>
                      <p><span className="font-medium">Type:</span> {draft.type.replace("_", " ")}</p>
                      <p><span className="font-medium">Submitted:</span> {new Date(draft.submittedAt).toLocaleDateString()}</p>
                      {draft.reviewedAt && (
                        <p><span className="font-medium">Reviewed:</span> {new Date(draft.reviewedAt).toLocaleDateString()}</p>
                      )}
                      {draft.organization && (
                        <p><span className="font-medium">Organization:</span> {draft.organization.name}</p>
                      )}
                    </div>

                    {draft.reviewNotes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Review Notes:</p>
                        <p className="text-sm">{draft.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="hover:bg-gray-50 hover:text-gray-700">
                      <Link href={`/admin/drafts/${draft.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredDrafts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDrafts.length} of {drafts.length} course drafts
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Search, Building2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  facebookPage?: string;
  latitude: number;
  longitude: number;
  district?: string;
  province?: string;
}

export default function OrganizationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);

  // Only platform admins can access this page
  useEffect(() => {
    if (session && session.user.role !== "PLATFORM_ADMIN") {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError("Failed to fetch organizations. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (session && session.user.role === "PLATFORM_ADMIN") {
      fetchOrganizations();
    }
  }, [session]);

  const confirmDeleteOrganization = (id: string) => {
    setOrgToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;

    try {
      const response = await fetch(`/api/organizations/${orgToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete organization");
      }

      // Remove from local state
      setOrganizations(organizations.filter((org) => org.id !== orgToDelete));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting organization:", error);
      setError(
        "Failed to delete organization. It may have associated courses."
      );
    }
  };

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link href="/admin/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Organization
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name, description, or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-red-50 text-red-500">
          {error}
        </div>
      )}

      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Organizations Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "No organizations match your search criteria. Try different keywords."
              : "Start by adding a new organization."}
          </p>
          {!searchTerm && (
            <Link href="/admin/organizations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Organization
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{org.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {org.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Email:</strong> {org.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {org.phone}
                  </p>
                  <p className="line-clamp-1">
                    <strong>Address:</strong> {org.address}
                    {org.district && `, ${org.district}`}
                    {org.province && `, ${org.province}`}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                <Link href={`/dashboard/courses/new?organizationId=${org.id}`}>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </Link>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/organizations/${org.id}/edit`)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDeleteOrganization(org.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action cannot be undone. Note that organizations with associated courses cannot be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

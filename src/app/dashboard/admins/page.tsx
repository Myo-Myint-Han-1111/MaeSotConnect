"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useToast } from "@/context/ToastContext";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
}

export default function OrganizationAdminsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const { showToast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check if user has appropriate role
  const isOrgAdmin = session?.user?.role === "ORGANIZATION_ADMIN";
  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";
  const organizationId = session?.user?.organizationId;

  const confirmDeleteAdmin = (adminId: string) => {
    // Prevent deleting yourself
    if (adminId === session?.user?.id) {
      showToast(
        "Error",
        "You cannot remove yourself as an administrator",
        "error"
      );
      return;
    }

    setAdminToDelete(adminId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete || !organizationId) return;

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/admins/${adminToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove administrator");
      }
      // Remove from local state
      const deletedAdmin = admins.find((admin) => admin.id === adminToDelete);
      setAdmins(admins.filter((admin) => admin.id !== adminToDelete));

      // Show success toast
      showToast(
        "Administrator Removed",
        deletedAdmin
          ? `${deletedAdmin.name} has been removed.`
          : "Administrator has been removed.",
        "success"
      );
    } catch (error) {
      console.error("Error removing administrator:", error);
      showToast("Error", "Failed to remove administrator.", "error");
    }
  };

  useEffect(() => {
    // Only organization admins and platform admins can access this page
    if (session && !isOrgAdmin && !isPlatformAdmin) {
      router.push("/dashboard");
    }
  }, [session, isOrgAdmin, isPlatformAdmin, router]);

  useEffect(() => {
    async function fetchAdmins() {
      if (!organizationId) return;

      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/admins`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch administrators");
        }
        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching admins:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session && organizationId) {
      fetchAdmins();
    }
  }, [session, organizationId]);

  // Filter admins based on search term
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!organizationId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be associated with an organization to view this page.
        </p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Organization Administrators</h1>
        <Link href="/dashboard/admins/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Administrator
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search administrators by name or email"
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

      {filteredAdmins.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No Administrators Found
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "No administrators match your search criteria. Try different keywords."
              : "Your organization doesn't have any administrators yet."}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/admins/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Administrator
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Manage administrators for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/admins/${admin.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDeleteAdmin(admin.id)}
                          disabled={admin.id === session?.user?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAdmin}
        title="Remove Administrator"
        description="Are you sure you want to remove this administrator? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

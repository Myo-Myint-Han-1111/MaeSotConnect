"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, UserPlus, ShieldAlert } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AdminEntry {
  id: string;
  email: string;
  addedBy: string | null;
  addedAt: string;
  notes: string | null;
}

export default function AdminAccessPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminNotes, setNewAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Check if user is platform admin
  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";

  useEffect(() => {
    if (!isPlatformAdmin) return;
    
    async function fetchAdmins() {
      try {
        const response = await fetch("/api/admin/allowlist");
        if (!response.ok) {
          throw new Error("Failed to fetch admin list");
        }
        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching admin list:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, [isPlatformAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/allowlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newAdminEmail,
          notes: newAdminNotes || undefined,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add admin");
      }
      
      const newAdmin = await response.json();
      setAdmins([newAdmin, ...admins]);
      setNewAdminEmail("");
      setNewAdminNotes("");
      
      showToast(
        "Admin Added",
        `${newAdminEmail} has been added to the admin allowlist.`,
        "success"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error adding admin:", err);
      
      showToast(
        "Error",
        err instanceof Error ? err.message : "Failed to add admin",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the admin allowlist?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/allowlist?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove admin");
      }
      
      setAdmins(admins.filter(admin => admin.id !== id));
      
      showToast(
        "Admin Removed",
        `${email} has been removed from the admin allowlist.`,
        "success"
      );
    } catch (err) {
      console.error("Error removing admin:", err);
      
      showToast(
        "Error",
        err instanceof Error ? err.message : "Failed to remove admin",
        "error"
      );
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a platform administrator to access this page.
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
      <h1 className="text-3xl font-bold mb-8">Manage Platform Admin Access</h1>
      
      {/* Add new admin form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Platform Admin</CardTitle>
          <CardDescription>
            Grant platform administrator access to a user by their email address
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddAdmin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add notes about this admin (optional)"
                value={newAdminNotes}
                onChange={(e) => setNewAdminNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <UserPlus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Platform Admin"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Admin list */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Admins</CardTitle>
          <CardDescription>
            Users on this list will be granted platform admin access when they sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No administrators in the allowlist yet.</p>
              <p className="text-sm mt-2">
                Note: The first user to sign in will automatically become a platform admin.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {new Date(admin.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{admin.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium">Important Notes:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Removing an email from this list will not affect existing administrators</li>
              <li>This list controls who can become a platform admin when signing in</li>
              <li>The first user to sign in to the application automatically becomes a platform admin</li>
              <li>Users specified in the ADMIN_EMAILS environment variable are also granted admin access</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
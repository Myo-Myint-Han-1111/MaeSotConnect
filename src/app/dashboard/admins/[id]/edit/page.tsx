"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext"; // Add this import

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
}

export default function EditAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const { showToast } = useToast(); // Add this hook

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get organization ID from session
  const organizationId = session?.user?.organizationId;

  // Check if user is organization admin
  const isOrgAdmin = session?.user?.role === "ORGANIZATION_ADMIN";

  useEffect(() => {
    // Redirect if not organization admin or no organization
    if (session && (!isOrgAdmin || !organizationId)) {
      router.push("/dashboard");
    }
  }, [session, isOrgAdmin, organizationId, router]);

  useEffect(() => {
    async function fetchAdmin() {
      if (!organizationId) return;

      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/admins/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch administrator");
        }

        const data = await response.json();
        setAdmin(data);
        setName(data.name);
        setEmail(data.email);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching administrator:", err);
      } finally {
        setFetchLoading(false);
      }
    }

    if (session && isOrgAdmin && organizationId && id) {
      fetchAdmin();
    }
  }, [session, isOrgAdmin, organizationId, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/admins/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            ...(password ? { password } : {}),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update administrator");
      }

      // Show success toast
      showToast(
        "Administrator Updated",
        `${name}'s information has been updated successfully.`,
        "success"
      );

      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        router.push("/dashboard/admins");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error updating administrator:", err);
      setIsLoading(false);
    }
  };

  if (!isOrgAdmin || !organizationId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be an organization administrator to edit administrators.
        </p>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Administrator Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The administrator you are looking for does not exist or you do not
          have permission to edit them.
        </p>
        <Button onClick={() => router.push("/dashboard/admins")}>
          Back to Administrators
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/admins")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Administrators
        </Button>
        <h1 className="text-2xl font-bold">Edit Administrator</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{admin.name}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-muted-foreground">
                If provided, password must be at least 8 characters
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/admins")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

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
import OrganizationSelect from "@/components/admin/OrganizationSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  organization?: {
    name: string;
  };
}

export default function EditUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Optional for updates
  const [role, setRole] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  // Check if user is platform admin
  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";

  useEffect(() => {
    // Redirect if not platform admin
    if (session && !isPlatformAdmin) {
      router.push("/dashboard");
    }
  }, [session, isPlatformAdmin, router]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data);

        // Initialize form state
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
        setOrganizationId(data.organizationId || "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching user:", err);
      } finally {
        setFetchLoading(false);
      }
    }

    if (session && isPlatformAdmin && id) {
      fetchUser();
    }
  }, [session, isPlatformAdmin, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          ...(password ? { password } : {}),
          role,
          organizationId: role === "ORGANIZATION_ADMIN" ? organizationId : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      router.push("/admin/users");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error updating user:", err);
      setIsLoading(false);
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The user you are looking for does not exist or has been deleted.
        </p>
        <Button onClick={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit User: {user.name}</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
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

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  // If changing to platform admin, clear organization
                  if (value === "PLATFORM_ADMIN") {
                    setOrganizationId("");
                  }
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
                  <SelectItem value="ORGANIZATION_ADMIN">
                    Organization Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "ORGANIZATION_ADMIN" && (
              <OrganizationSelect
                value={organizationId}
                onChange={setOrganizationId}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
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

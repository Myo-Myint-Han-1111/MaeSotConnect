"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OrganizationForm from "@/components/admin/OrganizationForm";

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
}

export default function EditOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await fetch(`/api/organizations/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch organization");
        }
        const data = await response.json();
        setOrganization(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load organization"
        );
        console.error("Error fetching organization:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOrganization();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">
          {error || "Organization not found"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
      <OrganizationForm mode="edit" initialData={organization} />
    </div>
  );
}

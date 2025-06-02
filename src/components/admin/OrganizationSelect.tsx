// src/components/admin/OrganizationSelect.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OrganizationSelect({
  value,
  onChange,
  disabled = false,
}: OrganizationSelectProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        console.error("Error fetching organizations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Organization</Label>
        <Select disabled value="" onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Loading organizations..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Organization</Label>
        <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Organization</Label>
      <Select disabled={disabled} value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an organization" />
        </SelectTrigger>
        <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
          <SelectGroup>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import React from "react";
import OrganizationForm from "@/components/admin/OrganizationForm";

export default function NewOrganizationPage() {
  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">Create New Organization</h1> */}
      <OrganizationForm mode="create" />
    </div>
  );
}

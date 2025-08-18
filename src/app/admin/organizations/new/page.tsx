"use client";

import React from "react";
import AdminOrganizationForm from "@/components/forms/AdminOrganizationForm";

export default function NewOrganizationPage() {
  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">Create New Organization</h1> */}
      <AdminOrganizationForm mode="create" />
    </div>
  );
}

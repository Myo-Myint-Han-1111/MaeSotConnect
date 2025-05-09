"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unknown error occurred";

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
      <p className="text-muted-foreground mb-6">{errorMessage}</p>
      <Link href="/auth/signin">
        <Button>Return to Sign In</Button>
      </Link>
    </div>
  );
}

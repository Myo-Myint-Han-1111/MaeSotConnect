// src/app/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
}

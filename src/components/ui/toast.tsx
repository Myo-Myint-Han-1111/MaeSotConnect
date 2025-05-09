"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

export function Toast({
  open,
  onClose,
  title,
  description,
  variant = "default",
  duration = 5000,
}: ToastProps) {
  const variantClasses = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
  };

  const titleClasses = {
    default: "text-gray-900",
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-amber-800",
  };

  const descriptionClasses = {
    default: "text-gray-500",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-amber-600",
  };

  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div
        className={cn(
          "rounded-lg border shadow-lg p-4 flex gap-3 items-start",
          variantClasses[variant]
        )}
      >
        <div className="flex-1">
          <h3 className={cn("text-sm font-medium", titleClasses[variant])}>
            {title}
          </h3>
          {description && (
            <p className={cn("mt-1 text-sm", descriptionClasses[variant])}>
              {description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className={cn(
            "rounded-full p-1 hover:bg-gray-100",
            variant === "success" && "hover:bg-green-100",
            variant === "error" && "hover:bg-red-100",
            variant === "warning" && "hover:bg-amber-100"
          )}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

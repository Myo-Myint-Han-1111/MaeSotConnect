"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { Toast } from "@/components/ui/toast";

type ToastVariant = "default" | "success" | "error" | "warning";

interface ToastContextType {
  showToast: (
    title: string,
    description?: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState<ToastVariant>("default");
  const [duration, setDuration] = useState(5000);

  const showToast = (
    title: string,
    description?: string,
    variant: ToastVariant = "default",
    duration: number = 5000
  ) => {
    setTitle(title);
    setDescription(description);
    setVariant(variant);
    setDuration(duration);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* Wrap children and Toast in a React Fragment to avoid key warnings */}
      <>
        {children}
        <Toast
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          description={description}
          variant={variant}
          duration={duration}
        />
      </>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

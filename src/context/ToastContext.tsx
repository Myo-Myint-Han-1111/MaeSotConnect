"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Toast } from "@/components/ui/toast";

type ToastVariant = "default" | "success" | "error" | "warning";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  showToast: (
    title: string,
    description?: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Fixed ID generation to avoid hydration issues
const generateToastId = (): string => {
  // Only generate IDs on the client side to avoid hydration mismatches
  if (typeof window === "undefined") {
    return "toast-ssr"; // Temporary ID for SSR
  }

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `toast-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before showing toasts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      variant: ToastVariant = "default",
      duration: number = 5000
    ) => {
      // Only show toasts on the client side
      if (!isClient) return;

      const id = generateToastId();
      const newToast: ToastData = {
        id,
        title,
        description,
        variant,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }
    },
    [isClient]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Only render toasts on the client side */}
      {isClient && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id} // Unique key for each toast
              open={true}
              onClose={() => removeToast(toast.id)}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              duration={0} // Disable auto-close in individual Toast since we handle it here
            />
          ))}
        </div>
      )}
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

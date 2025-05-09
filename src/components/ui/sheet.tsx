// src/components/ui/sheet.tsx
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

// Define proper types for SheetOverlay
interface SheetOverlayProps
  extends React.ComponentPropsWithRef<typeof SheetPrimitive.Overlay> {
  className?: string;
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...otherProps}
      ref={ref}
    />
  );
});
SheetOverlay.displayName = "SheetOverlay";

// Define proper types for SheetContent
interface SheetContentProps
  extends React.ComponentPropsWithRef<typeof SheetPrimitive.Content> {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  closeIcon?: boolean;
  children?: React.ReactNode;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>((props, ref) => {
  const {
    side = "right",
    className,
    children,
    closeIcon = true,
    ...otherProps
  } = props;

  const sideClasses = {
    top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    right:
      "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    bottom:
      "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 w-full gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "sm:max-w-sm w-3/4",
          side === "left" && "sm:max-w-sm w-3/4",
          sideClasses[side],
          className
        )}
        {...otherProps}
      >
        {children}
        {closeIcon && (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

// Define types for additional components
interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SheetHeader: React.FC<SheetHeaderProps> = (props) => {
  const { className, ...otherProps } = props;
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...otherProps}
    />
  );
};
SheetHeader.displayName = "SheetHeader";

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SheetFooter: React.FC<SheetFooterProps> = (props) => {
  const { className, ...otherProps } = props;
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...otherProps}
    />
  );
};
SheetFooter.displayName = "SheetFooter";

interface SheetTitleProps
  extends React.ComponentPropsWithRef<typeof SheetPrimitive.Title> {
  className?: string;
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...otherProps}
    />
  );
});
SheetTitle.displayName = "SheetTitle";

interface SheetDescriptionProps
  extends React.ComponentPropsWithRef<typeof SheetPrimitive.Description> {
  className?: string;
}

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>((props, ref) => {
  const { className, ...otherProps } = props;
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...otherProps}
    />
  );
});
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

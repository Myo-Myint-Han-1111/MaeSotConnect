import * as React from "react";
import { cn } from "../../lib/utils";

const badgeBaseClasses = "inline-flex items-center rounded-full border px-2.5 pt-1 pb-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeBaseClasses, className)}
      {...props}
    />
  );
}

export { Badge };

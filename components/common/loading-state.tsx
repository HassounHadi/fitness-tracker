"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingStateProps {
  size?: LoadingSize;
  text?: string;
  fullHeight?: boolean;
  className?: string;
}

const sizeClasses: Record<LoadingSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function LoadingState({
  size = "md",
  text,
  fullHeight = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullHeight ? "min-h-[60vh]" : "py-12",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

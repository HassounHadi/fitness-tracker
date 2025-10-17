"use client";

import { useState } from "react";
import Image from "next/image";
import { LucideIcon, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackIcon?: LucideIcon;
  fallbackText?: string;
  containerClassName?: string;
  imageClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain";
  unoptimized?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackIcon: FallbackIcon = Dumbbell,
  fallbackText,
  containerClassName,
  imageClassName,
  fill = true,
  width,
  height,
  objectFit = "cover",
  unoptimized = false,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn("relative bg-muted", containerClassName)}>
      {!imageError ? (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={cn(
            objectFit === "cover" ? "object-cover" : "object-contain",
            imageClassName
          )}
          onError={() => setImageError(true)}
          unoptimized={unoptimized}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <FallbackIcon className="h-6 w-6 md:h-12 md:w-12 text-muted-foreground" />
          {fallbackText && (
            <p className="text-muted-foreground text-xs md:text-sm mt-2">
              {fallbackText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: number;
  priority?: boolean;
}

export function AvatarImage({
  src,
  alt,
  className,
  size = 48,
  priority = false,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  // Generate 1-2 initials from name
  const initials = alt
    ? alt
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-xs uppercase select-none shrink-0 shadow-inner",
          className
        )}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-full shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        priority={priority}
        unoptimized={Boolean(src && (src.includes(".svg") || src.includes("dicebear")))}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

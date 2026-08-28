"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { usePresenceStore } from "@/stores/presenceStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080";

export interface AvatarProps {
  photo?: string | null;
  name?: string;
  size?: number;
  className?: string;
  /** When provided, renders an online/offline presence dot for this user id. */
  userId?: string;
}

export function Avatar({ photo, name, size = 40, className, userId }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const online = usePresenceStore((state) => (userId ? state.onlineIds.has(userId) : false));

  const filename = !photo || errored ? "default.jpg" : photo;
  const src = `${SOCKET_URL}/uploads/users/${filename}`;

  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-black/5 dark:bg-slate-700 dark:ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={name ? `${name}'s avatar` : "User avatar"}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setErrored(true)}
        unoptimized
      />
      {userId && online && (
        <span
          className="absolute bottom-0 right-0 block rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          style={{ width: Math.max(10, size * 0.25), height: Math.max(10, size * 0.25) }}
          aria-label="Online"
        />
      )}
    </span>
  );
}

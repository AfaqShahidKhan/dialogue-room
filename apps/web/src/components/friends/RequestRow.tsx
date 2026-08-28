"use client";

import { Check, X } from "lucide-react";
import type { Friendship, PublicUser } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

function asPublicUser(value: PublicUser | string): PublicUser | null {
  return typeof value === "string" ? null : value;
}

interface IncomingRequestRowProps {
  friendship: Friendship;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

export function IncomingRequestRow({
  friendship,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: IncomingRequestRowProps) {
  const requester = asPublicUser(friendship.requester);
  if (!requester) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/50">
      <Avatar photo={requester.photo} name={requester.name} size={44} userId={requester._id} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{requester.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {requester.country ?? "Wants to be your friend"}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" className="gap-1.5" isLoading={isAccepting} onClick={onAccept}>
          <Check className="size-[18px]" aria-hidden="true" />
          Accept
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5" isLoading={isDeclining} onClick={onDecline}>
          <X className="size-[18px]" aria-hidden="true" />
          Decline
        </Button>
      </div>
    </div>
  );
}

interface OutgoingRequestRowProps {
  friendship: Friendship;
  onCancel: () => void;
  isCancelling?: boolean;
}

export function OutgoingRequestRow({ friendship, onCancel, isCancelling }: OutgoingRequestRowProps) {
  const recipient = asPublicUser(friendship.recipient);
  if (!recipient) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/50">
      <Avatar photo={recipient.photo} name={recipient.name} size={44} userId={recipient._id} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{recipient.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">Request pending</p>
      </div>
      <Button size="sm" variant="outline" isLoading={isCancelling} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

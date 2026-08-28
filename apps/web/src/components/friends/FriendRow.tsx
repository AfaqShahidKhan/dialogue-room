"use client";

import { MoreHorizontal, MessageCircle } from "lucide-react";
import type { PublicUser } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmPopover } from "@/components/ui/ConfirmPopover";
import { useUnfriend } from "@/hooks/useFriendshipMutations";
import { useStartConversation } from "@/hooks/useStartConversation";

function LanguageChips({ user }: { user: PublicUser }) {
  const fluent = user.fluentLanguages.slice(0, 2).join(", ");
  const learning = user.learningLanguages.slice(0, 2).join(", ");
  if (!fluent && !learning) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {fluent && (
        <span
          title={`Speaks ${fluent}`}
          className="max-w-full truncate rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          Speaks {fluent}
        </span>
      )}
      {learning && (
        <span
          title={`Learning ${learning}`}
          className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          Learning {learning}
        </span>
      )}
    </div>
  );
}

export function FriendRow({ user }: { user: PublicUser }) {
  const unfriend = useUnfriend();
  const { startConversation, pendingUserId } = useStartConversation();
  const isStartingChat = pendingUserId === user._id;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/50">
      <Avatar photo={user.photo} name={user.name} size={44} userId={user._id} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
        <LanguageChips user={user} />
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5"
          disabled={isStartingChat}
          onClick={() => startConversation(user._id)}
        >
          {isStartingChat ? <Spinner size={14} /> : <MessageCircle className="size-[18px]" aria-hidden="true" />}
          Message
        </Button>
        <ConfirmPopover
          trigger={
            <Button size="sm" variant="ghost" aria-label="More options">
              <MoreHorizontal className="size-[18px]" aria-hidden="true" />
            </Button>
          }
          title={`Unfriend ${user.name}?`}
          description="You'll need to send a new friend request to reconnect."
          confirmLabel="Unfriend"
          isConfirming={unfriend.isPending}
          onConfirm={() => unfriend.mutate(user._id)}
        />
      </div>
    </div>
  );
}

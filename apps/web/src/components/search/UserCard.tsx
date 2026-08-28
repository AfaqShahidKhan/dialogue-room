"use client";

import { Check, MapPin, MessageCircle, UserPlus, X } from "lucide-react";
import type { DiscoveredUser } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useSendFriendRequest,
} from "@/hooks/useFriendshipMutations";
import { useStartConversation } from "@/hooks/useStartConversation";

/** Joins a full language list for the native tooltip, while the visible label only shows the first two. */
function summarizeLanguages(languages: string[]): { label: string; full: string } {
  const shown = languages.slice(0, 2).join(", ");
  const label = languages.length > 2 ? `${shown} +${languages.length - 2}` : shown;
  return { label, full: languages.join(", ") };
}

function LanguageChips({ user }: { user: DiscoveredUser }) {
  const fluent = user.fluentLanguages.length > 0 ? summarizeLanguages(user.fluentLanguages) : null;
  const learning = user.learningLanguages.length > 0 ? summarizeLanguages(user.learningLanguages) : null;

  if (!fluent && !learning) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {fluent && (
        <span
          title={`Speaks ${fluent.full}`}
          className="max-w-full truncate rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          Speaks {fluent.label}
        </span>
      )}
      {learning && (
        <span
          title={`Learning ${learning.full}`}
          className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          Learning {learning.label}
        </span>
      )}
    </div>
  );
}

export function UserCard({ user }: { user: DiscoveredUser }) {
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const { startConversation, pendingUserId } = useStartConversation();

  const isStartingChat = pendingUserId === user._id;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-800">
      <div className="flex items-center gap-3">
        <Avatar photo={user.photo} name={user.name} size={48} userId={user._id} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {user.name}
            {typeof user.age === "number" && (
              <span className="font-normal text-slate-500 dark:text-slate-400">, {user.age}</span>
            )}
          </p>
          {user.country && (
            <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{user.country}</span>
            </p>
          )}
        </div>
      </div>

      <LanguageChips user={user} />

      <div className="mt-auto flex items-center gap-2 pt-1">
        {user.relationStatus === "none" && (
          <Button
            size="sm"
            className="w-full gap-1.5"
            isLoading={sendRequest.isPending}
            onClick={() => sendRequest.mutate(user._id)}
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Add friend
          </Button>
        )}

        {user.relationStatus === "pendingOutgoing" && user.friendshipId && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            isLoading={cancelRequest.isPending}
            onClick={() => cancelRequest.mutate(user.friendshipId as string)}
          >
            Cancel request
          </Button>
        )}

        {user.relationStatus === "pendingIncoming" && user.friendshipId && (
          <>
            <Button
              size="sm"
              className="w-full gap-1.5"
              isLoading={acceptRequest.isPending}
              onClick={() => acceptRequest.mutate(user.friendshipId as string)}
            >
              <Check className="size-3.5" aria-hidden="true" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLoading={declineRequest.isPending}
              onClick={() => declineRequest.mutate(user.friendshipId as string)}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </>
        )}

        {user.relationStatus === "friends" && (
          <Button
            size="sm"
            variant="secondary"
            className="w-full gap-1.5"
            disabled={isStartingChat}
            onClick={() => startConversation(user._id)}
          >
            {isStartingChat ? <Spinner size={14} /> : <MessageCircle className="size-3.5" aria-hidden="true" />}
            Message
          </Button>
        )}
      </div>
    </div>
  );
}

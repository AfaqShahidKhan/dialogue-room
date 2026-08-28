"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserRoundX } from "lucide-react";
import { useFriends, useIncomingRequests, useOutgoingRequests } from "@/hooks/useFriends";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
} from "@/hooks/useFriendshipMutations";
import { Tabs, type TabItem } from "@/components/friends/Tabs";
import { FriendRow } from "@/components/friends/FriendRow";
import { IncomingRequestRow, OutgoingRequestRow } from "@/components/friends/RequestRow";
import { RowSkeletonList } from "@/components/friends/RowSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

type TabKey = "friends" | "incoming" | "sent";

export default function FriendsPage() {
  const [tab, setTab] = useState<TabKey>("friends");

  const friends = useFriends();
  const incoming = useIncomingRequests();
  const outgoing = useOutgoingRequests();

  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const cancelRequest = useCancelFriendRequest();

  const tabs: TabItem[] = [
    { key: "friends", label: "Friends", count: friends.data?.length ?? 0 },
    { key: "incoming", label: "Incoming", count: incoming.data?.length ?? 0 },
    { key: "sent", label: "Sent", count: outgoing.data?.length ?? 0 },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Friends
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Manage your connections and pending requests.
        </p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as TabKey)} />

      {tab === "friends" && (
        <>
          {friends.isLoading ? (
            <RowSkeletonList />
          ) : !friends.data || friends.data.length === 0 ? (
            <EmptyState
              icon={<Search className="size-6" aria-hidden="true" />}
              title="No friends yet"
              description="Search for language learners and send your first friend request."
              action={
                <Link href="/search">
                  <Button size="sm">Meet learners</Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {friends.data.map((user) => (
                <FriendRow key={user._id} user={user} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "incoming" && (
        <>
          {incoming.isLoading ? (
            <RowSkeletonList />
          ) : !incoming.data || incoming.data.length === 0 ? (
            <EmptyState
              icon={<UserRoundX className="size-6" aria-hidden="true" />}
              title="No incoming requests"
              description="When someone sends you a friend request, it'll show up here."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {incoming.data.map((friendship) => (
                <IncomingRequestRow
                  key={friendship._id}
                  friendship={friendship}
                  isAccepting={acceptRequest.isPending && acceptRequest.variables === friendship._id}
                  isDeclining={declineRequest.isPending && declineRequest.variables === friendship._id}
                  onAccept={() => acceptRequest.mutate(friendship._id)}
                  onDecline={() => declineRequest.mutate(friendship._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "sent" && (
        <>
          {outgoing.isLoading ? (
            <RowSkeletonList />
          ) : !outgoing.data || outgoing.data.length === 0 ? (
            <EmptyState
              icon={<Search className="size-6" aria-hidden="true" />}
              title="No sent requests"
              description="Friend requests you send will appear here until they're accepted."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {outgoing.data.map((friendship) => (
                <OutgoingRequestRow
                  key={friendship._id}
                  friendship={friendship}
                  isCancelling={cancelRequest.isPending && cancelRequest.variables === friendship._id}
                  onCancel={() => cancelRequest.mutate(friendship._id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

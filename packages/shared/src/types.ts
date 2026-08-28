import type { FriendshipStatus, Gender, RelationStatus } from "./constants";

/** Fields of another user that are safe to expose to any authenticated user. */
export interface PublicUser {
  _id: string;
  name: string;
  photo: string;
  bio?: string;
  country?: string;
  gender?: Gender;
  birthdate?: string;
  age?: number;
  fluentLanguages: string[];
  learningLanguages: string[];
  lastSeenAt?: string;
}

/** The authenticated user's own record. */
export interface Me extends PublicUser {
  email: string;
  role: "user" | "admin";
  onboardingComplete: boolean;
  agreedToTerms: boolean;
  createdAt: string;
}

export interface DiscoveredUser extends PublicUser {
  relationStatus: RelationStatus;
  /** Present when relationStatus is pendingIncoming/pendingOutgoing — the friendship doc id. */
  friendshipId?: string;
}

export interface Friendship {
  _id: string;
  requester: PublicUser | string;
  recipient: PublicUser | string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  /** Client-side echo for optimistic reconciliation; never persisted. */
  tempId?: string;
}

export interface ConversationListItem {
  _id: string;
  otherUser: PublicUser;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface MessagesPage {
  messages: ChatMessage[];
  /** Pass as `before` to fetch the next (older) page; null when exhausted. */
  nextCursor: string | null;
}

export interface Paginated<T> {
  users: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiEnvelope<T = unknown> {
  status: "success" | "fail" | "error";
  message?: string;
  data?: T;
}

/* Socket payloads (server → client) */
export interface MessageNewPayload {
  message: ChatMessage;
  tempId?: string;
}
export interface MessageReadPayload {
  conversationId: string;
  userId: string;
  readAt: string;
}
export interface TypingPayload {
  conversationId: string;
  userId: string;
}
export interface PresenceUpdatePayload {
  userId: string;
  online: boolean;
  lastSeenAt?: string;
}
export interface PresenceSnapshotPayload {
  onlineUserIds: string[];
}
export interface FriendRequestPayload {
  friendship: Friendship;
}

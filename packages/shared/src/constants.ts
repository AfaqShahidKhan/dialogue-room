export const SOCKET_EVENTS = {
  CONVERSATION_JOIN: "conversation:join",
  CONVERSATION_LEAVE: "conversation:leave",
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  PRESENCE_UPDATE: "presence:update",
  PRESENCE_SNAPSHOT: "presence:snapshot",
  FRIEND_REQUEST_NEW: "friendRequest:new",
  FRIEND_REQUEST_ACCEPTED: "friendRequest:accepted",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 30,
  PASSWORD_MIN: 8,
  BIO_MAX: 300,
  MESSAGE_MAX: 2000,
  MESSAGES_PAGE_DEFAULT: 30,
  MESSAGES_PAGE_MAX: 50,
  DISCOVERY_PAGE_DEFAULT: 20,
  DISCOVERY_PAGE_MAX: 50,
} as const;

export const GENDERS = ["male", "female", "nonBinary", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const FRIENDSHIP_STATUSES = ["pending", "accepted", "declined"] as const;
export type FriendshipStatus = (typeof FRIENDSHIP_STATUSES)[number];

/** Relationship between the viewer and another user, computed server-side. */
export const RELATION_STATUSES = [
  "none",
  "pendingOutgoing",
  "pendingIncoming",
  "friends",
] as const;
export type RelationStatus = (typeof RELATION_STATUSES)[number];

export const LANGUAGES = [
  "Arabic", "Bengali", "Chinese (Mandarin)", "Czech", "Danish", "Dutch",
  "English", "Farsi", "Filipino", "Finnish", "French", "German", "Greek",
  "Hebrew", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese",
  "Korean", "Malay", "Norwegian", "Pashto", "Polish", "Portuguese",
  "Punjabi", "Romanian", "Russian", "Spanish", "Swahili", "Swedish",
  "Tamil", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese",
] as const;

export const COUNTRIES = [
  "Afghanistan", "Algeria", "Argentina", "Australia", "Austria", "Bahrain",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Czech Republic", "Denmark", "Egypt", "Finland", "France", "Germany",
  "Greece", "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Japan", "Jordan", "Kenya", "Kuwait", "Lebanon",
  "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Oman", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Tanzania",
  "Thailand", "Tunisia", "Turkey", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam",
  "Yemen",
] as const;

export const COOKIE_NAMES = {
  ACCESS: "dr_access",
  REFRESH: "dr_refresh",
} as const;

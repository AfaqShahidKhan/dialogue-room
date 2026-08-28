import { faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/db";
import { env } from "../config/env";
import { User, Friendship, Conversation, Message } from "../models";
import { LANGUAGES, COUNTRIES, GENDERS } from "@dialogue-room/shared";

const DEMO_PASSWORD = "Password123!";

type UserDoc = InstanceType<typeof User>;

const stats = {
  usersCreated: 0,
  friendshipsCreated: 0,
  pendingRequests: 0,
  conversationsCreated: 0,
  messagesCreated: 0,
};

/** Tracks created pairs so we never attempt a duplicate friendship. */
const usedPairs = new Set<string>();
const pairKeyOf = (a: Types.ObjectId, b: Types.ObjectId) =>
  [a.toString(), b.toString()].sort().join(":");

async function createUser(email: string, name: string): Promise<UserDoc> {
  const fluentLanguages = faker.helpers.arrayElements(LANGUAGES as unknown as string[], {
    min: 1,
    max: 2,
  });
  const learningLanguages = faker.helpers
    .arrayElements(LANGUAGES as unknown as string[], { min: 2, max: 4 })
    .filter((lang) => !fluentLanguages.includes(lang))
    .slice(0, 3);
  if (learningLanguages.length === 0) {
    learningLanguages.push(
      (LANGUAGES as unknown as string[]).find((l) => !fluentLanguages.includes(l)) ?? "English",
    );
  }

  const user = await User.create({
    name,
    email,
    password: DEMO_PASSWORD,
    role: "user",
    photo: "default.jpg",
    bio: faker.person.bio(),
    country: faker.helpers.arrayElement(COUNTRIES as unknown as string[]),
    gender: faker.helpers.arrayElement(GENDERS),
    birthdate: faker.date.birthdate({ min: 18, max: 45, mode: "age" }),
    fluentLanguages,
    learningLanguages,
    onboardingComplete: true,
    agreedToTerms: true,
  });
  stats.usersCreated++;
  return user;
}

async function createFriendship(
  requester: UserDoc,
  recipient: UserDoc,
  status: "accepted" | "pending",
): Promise<boolean> {
  const key = pairKeyOf(requester._id, recipient._id);
  if (usedPairs.has(key) || requester._id.equals(recipient._id)) return false;
  try {
    await Friendship.create({ requester: requester._id, recipient: recipient._id, status });
    usedPairs.add(key);
    if (status === "accepted") stats.friendshipsCreated++;
    else stats.pendingRequests++;
    return true;
  } catch {
    usedPairs.add(key);
    return false;
  }
}

const CHAT_LINES = [
  "Hey! I saw you're learning my language — happy to help you practice.",
  "That would be amazing! I can help you with yours in exchange.",
  "How long have you been studying?",
  "About six months now. Speaking is the hardest part for me.",
  "Same here! Maybe we can do a voice call sometime this week?",
  "Sure. What time zone are you in?",
  "I'm free most evenings after 7.",
  "Perfect, that works for me too.",
  "By the way, do you have any podcast recommendations for beginners?",
  "Yes! I'll send you a few links, they helped me a lot.",
  "Thanks! Your grammar is really good already, honestly.",
  "You're too kind — I still mix up tenses all the time.",
  "Everyone does at first. Consistency matters more than perfection.",
  "True. Okay, talk soon then?",
  "Talk soon! Have a great day.",
  "One more thing — how do you say 'good luck' in your language?",
  "Haha, I'll teach you that first thing on our call.",
  "Deal 😄",
  "Looking forward to it!",
  "Me too!",
];

/**
 * Creates a conversation with alternating messages. The final 1-3 messages are
 * authored by `other` and left unread by `demoUser`, so unread badges show up
 * for the demo logins.
 */
async function createConversation(demoUser: UserDoc, other: UserDoc): Promise<void> {
  const [p1, p2] = [demoUser._id.toString(), other._id.toString()].sort();
  const participants = [new Types.ObjectId(p1!), new Types.ObjectId(p2!)];

  const conversation = await Conversation.create({ participants, readState: new Map() });
  stats.conversationsCreated++;

  const messageCount = faker.number.int({ min: 8, max: 18 });
  const unreadCount = faker.number.int({ min: 1, max: 3 });
  const now = Date.now();
  const startOffset = faker.number.int({ min: 2, max: 6 }) * 24 * 3600_000;

  let lastMessage: InstanceType<typeof Message> | null = null;
  let lastReadByDemo = new Date(now - startOffset);

  for (let i = 0; i < messageCount; i++) {
    const isUnreadTail = i >= messageCount - unreadCount;
    // Alternate senders for the body; the unread tail always comes from `other`.
    const sender = isUnreadTail ? other : i % 2 === 0 ? demoUser : other;
    const createdAt = new Date(now - startOffset + i * faker.number.int({ min: 5, max: 180 }) * 60_000);
    const isFromOther = sender._id.equals(other._id);

    lastMessage = await Message.create({
      conversation: conversation._id,
      sender: sender._id,
      content: CHAT_LINES[i % CHAT_LINES.length],
      // Everything before the tail has been read by both sides.
      readAt: isUnreadTail && isFromOther ? null : createdAt,
      createdAt,
    });
    stats.messagesCreated++;
    if (!isUnreadTail) lastReadByDemo = createdAt;
  }

  if (lastMessage) {
    conversation.lastMessageAt = lastMessage.createdAt;
    conversation.lastMessagePreview = lastMessage.content.slice(0, 120);
    // `other` has read everything; the demo user stopped before the unread tail.
    conversation.readState.set(other._id.toString(), lastMessage.createdAt);
    conversation.readState.set(demoUser._id.toString(), lastReadByDemo);
    await conversation.save();
  }
}

async function seed(): Promise<void> {
  if (env.NODE_ENV === "production") {
    console.error("❌ Seed script cannot run in production. Set NODE_ENV=development.");
    process.exit(1);
  }

  try {
    await connectDatabase();

    console.log("🧹 Wiping collections...");
    await Promise.all([
      User.deleteMany({}),
      Friendship.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);

    console.log("👥 Creating 24 users...");
    const alice = await createUser("alice@example.com", "Alice Cooper");
    const bob = await createUser("bob@example.com", "Bob Dylan");
    const others: UserDoc[] = [];
    for (let i = 2; i < 24; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      others.push(
        await createUser(
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          `${firstName} ${lastName}`,
        ),
      );
    }

    console.log("🤝 Creating friendships...");
    await createFriendship(alice, bob, "accepted");
    // Alice and Bob each befriend ~5 distinct others.
    const aliceFriends = faker.helpers.arrayElements(others, 5);
    for (const friend of aliceFriends) await createFriendship(alice, friend, "accepted");
    const bobFriends = faker.helpers.arrayElements(
      others.filter((u) => !aliceFriends.includes(u)),
      5,
    );
    for (const friend of bobFriends) await createFriendship(friend, bob, "accepted");
    // ~18 random accepted pairs among the rest (duplicates skipped via pairKey set).
    for (let i = 0; i < 18; i++) {
      const [u1, u2] = faker.helpers.arrayElements(others, 2);
      if (u1 && u2) await createFriendship(u1, u2, "accepted");
    }

    console.log("📬 Creating pending friend requests...");
    // Incoming requests for alice/bob from unrelated users, plus a couple outgoing.
    const unrelated = others.filter(
      (u) =>
        !usedPairs.has(pairKeyOf(u._id, alice._id)) && !usedPairs.has(pairKeyOf(u._id, bob._id)),
    );
    const incoming = faker.helpers.arrayElements(unrelated, Math.min(8, unrelated.length));
    for (const [i, sender] of incoming.entries()) {
      await createFriendship(sender, i % 2 === 0 ? alice : bob, "pending");
    }
    const outgoingTargets = others.filter(
      (u) => !usedPairs.has(pairKeyOf(u._id, alice._id)),
    );
    for (const target of faker.helpers.arrayElements(outgoingTargets, Math.min(2, outgoingTargets.length))) {
      await createFriendship(alice, target, "pending");
    }

    console.log("💬 Creating conversations and messages...");
    await createConversation(alice, bob);
    for (const friend of aliceFriends.slice(0, 3)) await createConversation(alice, friend);
    for (const friend of bobFriends.slice(0, 2)) await createConversation(bob, friend);

    await disconnectDatabase();

    console.log("\n✨ Seed complete!\n");
    console.log("┌─────────────────────────────────────┐");
    console.log("│ Seeded Data Summary                 │");
    console.log("├─────────────────────────────────────┤");
    console.log(`│ Users created:         ${String(stats.usersCreated).padEnd(13)}│`);
    console.log(`│ Accepted friendships:  ${String(stats.friendshipsCreated).padEnd(13)}│`);
    console.log(`│ Pending requests:      ${String(stats.pendingRequests).padEnd(13)}│`);
    console.log(`│ Conversations created: ${String(stats.conversationsCreated).padEnd(13)}│`);
    console.log(`│ Messages created:      ${String(stats.messagesCreated).padEnd(13)}│`);
    console.log("├─────────────────────────────────────┤");
    console.log("│ Demo Logins:                        │");
    console.log("│   alice@example.com                 │");
    console.log("│   bob@example.com                   │");
    console.log("│   Password: Password123!            │");
    console.log("└─────────────────────────────────────┘\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  }
}

void seed();

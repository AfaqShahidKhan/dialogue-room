"use client";

import Link from "next/link";
import { MessagesSquare, Search, Users } from "lucide-react";
import { useMe } from "@/hooks/useMe";

const cards = [
  {
    href: "/search",
    icon: Search,
    title: "Meet learners",
    description: "Discover language learners by country, language and more.",
  },
  {
    href: "/friends",
    icon: Users,
    title: "Friends",
    description: "See your friends and manage pending requests.",
  },
  {
    href: "/chat",
    icon: MessagesSquare,
    title: "Chat",
    description: "Jump back into your conversations.",
  },
];

export default function HomePage() {
  const { data: user } = useMe();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Here&apos;s what you can do today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:focus-visible:ring-offset-slate-900"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900 dark:text-brand-300">
              <card.icon className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

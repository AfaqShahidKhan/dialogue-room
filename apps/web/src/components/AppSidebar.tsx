"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { disconnectSocket } from "@/lib/socket";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTotalUnreadCount } from "@/hooks/useConversations";
import type { Me } from "@dialogue-room/shared";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export interface AppSidebarProps {
  user: Me;
  onNavigate?: () => void;
}

export function AppSidebar({ user, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clear);
  const totalUnread = useTotalUnreadCount();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore - proceed to clear client state regardless
    } finally {
      clearUser();
      disconnectSocket();
      queryClient.clear();
      router.push("/login");
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-lg font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-100 dark:focus-visible:ring-offset-slate-900"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <MessageCircle className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          Dialogue Room
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
          aria-label="Close menu"
        >
          <X className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-600"
                  aria-hidden="true"
                />
              )}
              <item.icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/chat" && totalUnread > 0 && (
                <Badge variant="unread">{totalUnread > 99 ? "99+" : totalUnread}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="-mx-2 flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60">
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            <Avatar photo={user.photo} name={user.name} size={36} userId={user._id} />
            <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {user.name}
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
        >
          <LogOut className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}

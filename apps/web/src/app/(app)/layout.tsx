"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { AppSidebar } from "@/components/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/login");
    }
  }, [isLoading, isError, router]);

  useEffect(() => {
    if (!isLoading && user && user.onboardingComplete === false && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isLoading, user, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return <FullPageSpinner label="Loading your account" />;
  }

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <AppSidebar user={user} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 animate-in-fade bg-black/40 transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-64 animate-in-fade border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <AppSidebar user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 px-4 lg:hidden dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
          >
            <Menu className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Dialogue Room
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

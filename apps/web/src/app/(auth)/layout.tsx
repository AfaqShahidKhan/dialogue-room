"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user, router]);

  if (isLoading || user) {
    return <FullPageSpinner label="Loading" />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] size-[34rem] -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-600/15" />
        <div
          className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.400/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:[background-image:radial-gradient(circle_at_1px_1px,theme(colors.slate.100/0.06)_1px,transparent_0)]"
          aria-hidden="true"
        />
      </div>

      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-brand-600 shadow-sm shadow-brand-500/30">
            <Image src="/logo.png" alt="" width={32} height={32} className="size-full object-cover" />
          </span>
          Dialogue Room
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-brand-500/25">
            <Image src="/logo.png" alt="Dialogue Room" width={48} height={48} className="size-full object-cover" priority />
          </span>
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

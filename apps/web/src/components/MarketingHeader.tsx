"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useMe } from "@/hooks/useMe";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingHeader() {
  const { data: user, isLoading } = useMe();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: -16 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-30 border-b transition-colors duration-300",
        scrolled
          ? "border-white/10 bg-charcoal-950/80 backdrop-blur-md"
          : "border-transparent bg-charcoal-950/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
        >
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-charcoal-800 ring-1 ring-white/10">
            <Image src="/logo.png" alt="" width={32} height={32} className="size-full object-cover" priority />
          </span>
          Dialogue Room
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && !user && (
            <>
              <Link href="/login">
                <Button variant="ghostOnDark" size="sm" className="focus-visible:ring-offset-charcoal-950">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="amber" size="sm" className="focus-visible:ring-offset-charcoal-950">
                  Get started
                </Button>
              </Link>
            </>
          )}
          {!isLoading && user && (
            <Link href="/home">
              <Button variant="amber" size="sm" className="focus-visible:ring-offset-charcoal-950">
                Open app
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}

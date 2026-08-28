import Link from "next/link";
import Image from "next/image";
import { Github, MessageCircle, Twitter } from "lucide-react";
import { Panel } from "@/components/marketing/Panel";

const productLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

const socialLinks = [
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "GitHub", icon: Github },
];

export function MarketingFooter() {
  return (
    <div className="pb-6 pt-2 sm:pb-8">
      <Panel tone="raised" className="px-6 py-10 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-charcoal-700 ring-1 ring-white/10">
                <Image src="/logo.png" alt="" width={32} height={32} className="size-full object-cover" />
              </span>
              Dialogue Room
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Practice languages with real people, in real time.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded text-sm text-slate-300 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-800"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-slate-300 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Community</h3>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full bg-charcoal-700 text-slate-300 transition-colors hover:bg-amber-400/15 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-800"
                >
                  <social.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p className="flex items-center gap-1.5">
            <MessageCircle className="size-3.5" aria-hidden="true" />
            &copy; {new Date().getFullYear()} Dialogue Room. All rights reserved.
          </p>
        </div>
      </Panel>
    </div>
  );
}

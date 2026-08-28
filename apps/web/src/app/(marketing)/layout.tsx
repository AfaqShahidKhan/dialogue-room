import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

/**
 * The marketing surface is always dark, independent of the in-app theme
 * toggle (which lives in the app shell, not here). `.marketing-surface`
 * (globals.css) pins the charcoal background + color-scheme locally so nested
 * form controls, scrollbars, etc. render as dark without touching
 * ThemeProvider or the "dark" class on <html>.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-surface flex min-h-dvh flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

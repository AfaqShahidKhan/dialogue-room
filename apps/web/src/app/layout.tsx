import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider, themeNoFlashScript } from "@/providers/ThemeProvider";
import { SocketProvider } from "@/providers/SocketProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dialogue Room — practice languages with real people",
    template: "%s | Dialogue Room",
  },
  description:
    "Meet language learners around the world, become friends and chat in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeNoFlashScript}
        </Script>
      </head>
      <body className="min-h-dvh bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <QueryProvider>
          <ThemeProvider>
            <SocketProvider>
              {children}
              <Toaster richColors position="top-right" />
            </SocketProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

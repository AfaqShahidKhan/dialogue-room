import "./globals.css";
import ReduxProvider from "./ReduxProvider";
import Loading from "./loading";
import { Suspense } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/ui/Header";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { SocketProvider } from "./providers/SocketProvider";

const ClientLayout = dynamic(() => import("./ClientLayout"), {
  suspense: true,
});

export const metadata = {
  title: {
    template:
      "%s / Dialogue Room - Connect, Learn, and Grow through Conversations",
    default:
      "Welcome / Dialogue Room - Connect, Learn, and Grow through Conversations",
  },
  description:
    "Join Dialogue Room, a platform designed to foster meaningful conversations. Connect with like-minded individuals, learn new skills, and grow through interactive discussions. Whether you're looking to exchange ideas, improve your communication, or just have a good chat, Dialogue Room is the place to be.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem("theme") || "light";
                document.documentElement.setAttribute("data-theme", theme);
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="transition-colors duration-300">
        <ThemeProvider>
          <ReduxProvider>
            <Toaster />
            <Suspense fallback={<Loading />}>
              <ClientLayout>
                <SocketProvider>{children}</SocketProvider>
              </ClientLayout>
            </Suspense>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

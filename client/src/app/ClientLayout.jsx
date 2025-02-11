"use client";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import Footer from "@/components/ui/Footer";

const ClientLayout = ({ children }) => {
  const pathname = usePathname();
  const token = useSelector((state) => state.auth.token);

  // Pages where the Sidebar should NOT be shown
  const excludedRoutes = ["/login", "/signup"];

  // Sidebar should be visible on all pages **except** excluded ones
  // AND on `/` only if `HomeAuth` is shown (user is logged in)
  const shouldShowSidebar =
    token && (!excludedRoutes.includes(pathname) || pathname === "/");

  return (
    <div className="flex">
      {shouldShowSidebar && <Sidebar />}
      <main className="flex-1">
        {children} <Footer />
      </main>
    </div>
  );
};

export default ClientLayout;

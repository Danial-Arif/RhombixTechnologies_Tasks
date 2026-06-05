"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileMenu from "@/components/MobileMenu";
import PixelLoader from "@/components/ui/PixelLoader";

function getPageTitle(pathname) {
  if (pathname === "/") return "Library";
  if (pathname === "/profile") return "My Profile";
  if (/^\/books\/[^/]+$/.test(pathname)) return "Book Details";
  return "Library";
}

export default function AppShell({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center reader-canvas">
        <div className="reader-loading-card p-8 sm:p-10">
          <PixelLoader message="Starting up" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar session={session} pathname={pathname} />

      <div className="app-main">
        <TopBar
          pageTitle={getPageTitle(pathname)}
          session={session}
          menuOpen={menuOpen}
          onMenuToggle={toggleMenu}
        />
        <MobileMenu
          isOpen={menuOpen}
          onClose={closeMenu}
          session={session}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

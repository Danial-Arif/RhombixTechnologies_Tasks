"use client";

import Link from "next/link";
import { Library, Menu, X } from "lucide-react";
import { signIn } from "next-auth/react";
import UserAvatar from "./ui/UserAvatar";

export default function TopBar({ pageTitle, session, menuOpen = false, onMenuToggle }) {
  const user = session?.user;

  return (
    <header className="app-header">
      {/* Mobile header */}
      <div className="flex lg:hidden items-center gap-3 px-4 h-[var(--mobile-header-height)]">
        <button
          type="button"
          onClick={onMenuToggle}
          className={`mobile-menu-trigger ${menuOpen ? "mobile-menu-trigger--open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="w-[18px] h-[18px]" strokeWidth={2} />
          ) : (
            <Menu className="w-[18px] h-[18px]" strokeWidth={2} />
          )}
        </button>

        <div className="min-w-0 flex-1 text-center px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted leading-none">
            BookVault
          </p>
          <h1 className="text-[15px] font-semibold text-text-primary tracking-tight truncate mt-1 leading-tight">
            {pageTitle}
          </h1>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="shrink-0 w-9 h-9 rounded-full overflow-hidden border border-white/80 shadow-sm ring-1 ring-black/[0.04]"
            aria-label="Open profile"
          >
            <UserAvatar user={user} className="w-full h-full" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="shrink-0 w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center"
            aria-label="Sign in"
          >
            <Library className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between px-6 xl:px-8 h-[var(--topbar-height)]">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="text-xs text-text-muted font-medium hover:text-text-primary transition-colors shrink-0"
          >
            BookVault
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          <span className="text-sm font-semibold text-text-primary truncate">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border">
                <UserAvatar user={user} className="w-full h-full" />
              </div>
              <span className="text-sm font-medium text-text-primary max-w-[160px] truncate">
                {user.name}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Library className="w-4 h-4" />
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

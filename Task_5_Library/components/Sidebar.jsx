"use client";

import Link from "next/link";
import {
  Library,
  User as UserIcon,
  LogIn,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import UserAvatar from "./ui/UserAvatar";

const navItems = [
  { href: "/", label: "Library", icon: Library, match: (path) => path === "/" || /^\/books\/[^/]+$/.test(path) },
];

export default function Sidebar({ session, pathname }) {
  const user = session?.user;

  return (
    <nav className="app-sidebar" aria-label="Sidebar navigation">
      <div>
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-text-primary tracking-tight leading-none">
                BookVault
              </h1>
              <p className="text-[10px] text-text-muted font-medium mt-1">Library Management</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-5">
          <span className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em]">
            Menu
          </span>
          <ul className="mt-2.5 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = item.match(pathname);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link href={item.href} className={`nav-link ${isActive ? "nav-link--active" : ""}`}>
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />}
                  </Link>
                </li>
              );
            })}

            {user && (
              <li>
                <Link
                  href="/profile"
                  className={`nav-link ${pathname === "/profile" ? "nav-link--active" : ""}`}
                >
                  <UserIcon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1 text-left">My Profile</span>
                  {pathname === "/profile" && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  )}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="px-3 pb-5 border-t border-border pt-4 space-y-3">
        {user ? (
          <div className="space-y-2">
            <Link href="/profile" className="sidebar-user-card">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent/15 shrink-0">
                <UserAvatar user={user} className="w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-primary truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-text-muted truncate mt-0.5">Reader</div>
              </div>
            </Link>
            <button type="button" onClick={() => signOut()} className="sidebar-signout-btn">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => signIn("google")} className="sidebar-signin-btn">
            <LogIn className="w-3.5 h-3.5" />
            Sign In with Google
          </button>
        )}

        <p className="text-[9px] font-medium text-text-muted text-center tracking-wider uppercase pt-1">
          BookVault v3.0
        </p>
      </div>
    </nav>
  );
}

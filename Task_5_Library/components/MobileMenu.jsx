"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  User,
  LogIn,
  LogOut,
  X,
  ChevronRight,
  Upload,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import UserAvatar from "./ui/UserAvatar";

function isLibraryActive(pathname) {
  return pathname === "/" || /^\/books\/[^/]+$/.test(pathname);
}

const navLinks = [
  {
    href: "/",
    label: "Library",
    description: "Browse all books",
    icon: Library,
    match: isLibraryActive,
  },
  {
    href: "/profile",
    label: "My Profile",
    description: "Your uploads & account",
    icon: User,
    match: (path) => path === "/profile",
    requiresAuth: true,
  },
  {
    href: "/profile?upload=true",
    label: "Upload Book",
    description: "Add a new title",
    icon: Upload,
    match: () => false,
    requiresAuth: true,
  },
];

export default function MobileMenu({ isOpen, onClose, session }) {
  const pathname = usePathname();
  const user = session?.user;
  const [mounted, setMounted] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (isOpen) onClose();
    }
  }, [pathname, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (mq.matches) onClose();
    };
    mq.addEventListener("change", onResize);
    return () => mq.removeEventListener("change", onResize);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="mobile-menu-root" role="presentation">
          <motion.button
            type="button"
            aria-label="Close menu"
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            key="mobile-menu-panel"
            className="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-panel__shine" aria-hidden="true" />

            <div className="mobile-menu-panel__header">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/80">
                  Navigation
                </p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">BookVault</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mobile-menu-close"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="mobile-menu-nav">
              {navLinks.map((item) => {
                if (item.requiresAuth && !user) return null;
                const Icon = item.icon;
                const active = item.match(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`mobile-menu-link ${active ? "mobile-menu-link--active" : ""}`}
                  >
                    <span className="mobile-menu-link__icon">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-text-muted mt-0.5">{item.description}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted/50 shrink-0" />
                  </Link>
                );
              })}
            </nav>

            <div className="mobile-menu-footer">
              {user ? (
                <>
                  <Link href="/profile" onClick={onClose} className="mobile-menu-user">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/60 shadow-sm shrink-0">
                      <UserAvatar user={user} className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">View profile</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      signOut();
                    }}
                    className="mobile-menu-signout"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    signIn("google");
                  }}
                  className="mobile-menu-signin"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

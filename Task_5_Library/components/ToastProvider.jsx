"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      containerClassName="!top-4 sm:!top-4"
      containerStyle={{
        top: "max(1rem, env(safe-area-inset-top))",
      }}
      toastOptions={{
        duration: 3000,
        className: "toast-item",
        style: {
          background: "var(--surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          fontSize: "14px",
          borderRadius: "12px",
          boxShadow: "var(--shadow-md)",
          maxWidth: "calc(100vw - 2rem)",
        },
        success: {
          iconTheme: { primary: "var(--accent)", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}

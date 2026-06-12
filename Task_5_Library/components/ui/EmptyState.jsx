"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  const Icon = icon || Inbox;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--border)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-xs leading-relaxed">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 bg-accent text-white text-xs font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

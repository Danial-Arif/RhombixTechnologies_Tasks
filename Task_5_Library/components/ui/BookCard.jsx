"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function BookCard({ book, href, onViewDetails, index = 0 }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--border)]">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent-muted">
            <BookOpen className="w-12 h-12 text-accent opacity-40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-semibold">View Details →</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-[13px] sm:text-sm font-bold text-text-primary line-clamp-2 sm:line-clamp-1 group-hover:text-accent transition-colors duration-200 leading-snug">
            {book.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-text-muted line-clamp-1">{book.author}</p>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <div onClick={() => onViewDetails?.(book)} role="button" tabIndex={0}>
      {content}
    </div>
  );
}

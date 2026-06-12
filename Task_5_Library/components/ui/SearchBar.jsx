"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search books...", className = "" }) {
  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <Search className="w-4 h-4 text-text-muted" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 min-h-[44px] bg-surface border border-border rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200 shadow-[var(--shadow-xs)]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

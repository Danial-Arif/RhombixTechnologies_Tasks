"use client";

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-xs)]">
      <div className="aspect-[3/4] w-full skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton rounded-full" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-1.5 w-full skeleton rounded-full mt-2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <div className="w-10 h-14 skeleton rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 skeleton" />
        <div className="h-3 w-1/4 skeleton" />
      </div>
      <div className="h-3 w-20 skeleton rounded-full" />
      <div className="h-3 w-16 skeleton" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 skeleton" />
          <div className="h-8 w-16 skeleton" />
          <div className="h-3 w-32 skeleton" />
        </div>
        <div className="w-11 h-11 skeleton rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "./ui/BookCard";
import SearchBar from "./ui/SearchBar";
import EmptyState from "./ui/EmptyState";
import PageContainer from "./ui/PageContainer";
import { SkeletonCard } from "./ui/SkeletonLoader";
import { useSession } from "next-auth/react";

const SORT_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "recent", label: "Recently Added" },
];

export default function Library() {
  const router = useRouter();
  const { data: session } = useSession();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books?page=${page}&limit=10&search=${search}&sort=${sortBy}`);
      const data = await res.json();
      if (data.books) {
        setBooks(data.books);
        setTotalPages(data.pagination.pages);
        setTotalBooks(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, sortBy]);

  return (
    <PageContainer className="space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight lg:hidden">
            Browse the collection
          </h2>
          <h2 className="hidden lg:block text-2xl font-bold text-text-primary tracking-tight">
            Library
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Discover and read books from the library.
          </p>
        </div>
        {session && (
          <button
            onClick={() => router.push("/profile?upload=true")}
            className="hidden sm:flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Book
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search title or author..."
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none text-sm font-medium text-text-secondary bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/15 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <div className="text-xs text-text-muted">
        {loading ? "Loading..." : `${totalBooks} book${totalBooks !== 1 ? "s" : ""} found`}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : books.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={page + sortBy + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            {books.map((book, i) => (
              <BookCard
                key={book._id}
                book={{
                  id: book._id,
                  title: book.title,
                  author: book.author,
                  image: book.coverImage,
                }}
                index={i}
                href={`/books/${book._id}`}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <EmptyState
          title="No books found"
          description="Try adjusting your search or upload a new book."
          action={() => setSearch("")}
          actionLabel="Clear Search"
        />
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-sm font-medium text-text-secondary tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      )}
    </PageContainer>
  );
}

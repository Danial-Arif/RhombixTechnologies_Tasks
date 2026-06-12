"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, User, Mail, Plus } from "lucide-react";
import BookCard from "./ui/BookCard";
import UserAvatar from "./ui/UserAvatar";
import UploadBookModal from "./UploadBookModal";
import PageContainer from "./ui/PageContainer";

export default function Profile({ user, openUpload = false }) {
  const router = useRouter();
  const [userBooks, setUserBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchUserBooks = () => {
    if (!user?.email) return;
    setLoading(true);
    fetch(`/api/books?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data.books) {
          setUserBooks(data.books.filter((b) => b.uploadedBy === user.email));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchBorrowedBooks = () => {
    if (!user?.email) return;
    setBorrowLoading(true);
    fetch(`/api/borrow`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.records) {
          const activeBorrows = data.records
            .filter((r) => r.status === "borrowed" && r.bookId)
            .map((r) => r.bookId);
          setBorrowedBooks(activeBorrows);
        }
        setBorrowLoading(false);
      })
      .catch(() => setBorrowLoading(false));
  };

  useEffect(() => {
    fetchUserBooks();
    fetchBorrowedBooks();
  }, [user]);

  useEffect(() => {
    if (openUpload) {
      setIsUploadModalOpen(true);
      router.replace("/profile", { scroll: false });
    }
  }, [openUpload, router]);

  const handleUploadSuccess = () => {
    fetchUserBooks();
  };

  if (!user) return null;

  return (
    <PageContainer className="space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-accent/10 shrink-0">
          <UserAvatar user={user} className="w-full h-full" iconClassName="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight truncate">
            {user.name}
          </h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start gap-2 sm:gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-text-secondary max-w-full">
              <Mail className="w-4 h-4 text-text-muted shrink-0" />
              <span className="truncate">{user.email}</span>
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 text-accent shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">
              Your Uploaded Books
            </h2>
            <span className="bg-accent-muted text-accent text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
              {userBooks.length}
            </span>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Book
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-text-muted py-8 text-center">Loading your books...</div>
        ) : userBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {userBooks.map((book, i) => (
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
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8 sm:p-12 text-center shadow-[var(--shadow-xs)]">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted opacity-30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary">No books uploaded yet</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
              You haven&apos;t uploaded any books to the library yet.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload Your First Book
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          <BookOpen className="w-5 h-5 text-green-600 shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">
            Books You've Borrowed
          </h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
            {borrowedBooks.length}
          </span>
        </div>

        {borrowLoading ? (
          <div className="text-sm text-text-muted py-8 text-center">Loading borrowed books...</div>
        ) : borrowedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {borrowedBooks.map((book, i) => (
              <BookCard
                key={`borrow-${book._id}`}
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
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8 sm:p-12 text-center shadow-[var(--shadow-xs)]">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted opacity-30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary">No active borrowed books</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
              You aren't borrowing any books right now.
            </p>
          </div>
        )}
      </motion.div>

      <UploadBookModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </PageContainer>
  );
}

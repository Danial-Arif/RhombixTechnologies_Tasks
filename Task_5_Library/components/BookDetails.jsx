"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Calendar,
  Download,
  Trash2,
  FileText,
  BookOpen,
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import PageContainer from "./ui/PageContainer";
import { SkeletonCard } from "./ui/SkeletonLoader";

function prefetchPdf(url) {
  if (!url || document.querySelector(`link[data-prefetch-pdf="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = url;
  link.setAttribute("data-prefetch-pdf", url);
  document.head.appendChild(link);
}

export default function BookDetails({ bookId }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const prefetchedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/books/${bookId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setBook(data))
      .catch(() => {
        toast.error("Book not found");
        router.replace("/");
      })
      .finally(() => setLoading(false));

    if (session?.user?.email) {
      fetch(`/api/borrow/check?bookId=${bookId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsBorrowed(data.isBorrowed);
          }
        })
        .catch(console.error);
    }
  }, [bookId, router, session]);

  if (loading) {
    return (
      <PageContainer className="space-y-6 sm:space-y-8 pb-28 lg:pb-8">
        <div className="h-5 w-32 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="aspect-[2/3] max-w-[280px] sm:max-w-[320px] mx-auto w-full skeleton rounded-[var(--radius-lg)]" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-9 w-4/5 skeleton" />
            <div className="h-5 w-1/3 skeleton" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!book) return null;

  const isUploader = session?.user?.email === book.uploadedBy;
  const uploaderName = book.uploadedByName || "Unknown";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/books/${book._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Book deleted successfully");
        router.push("/");
      } else {
        toast.error("Failed to delete book");
      }
    } catch {
      toast.error("Error deleting book");
    }
  };

  const handleDownloadPdf = () => {
    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank");
    } else {
      toast.error("No PDF available for this book");
    }
  };

  const handlePrefetch = () => {
    if (book.pdfUrl && !prefetchedRef.current) {
      prefetchPdf(book.pdfUrl);
      prefetchedRef.current = true;
    }
  };

  const handleReadOnline = () => {
    if (book.pdfUrl) {
      prefetchPdf(book.pdfUrl);
      router.push(`/books/${book._id}/read`);
    } else {
      toast.error("No PDF available to read online");
    }
  };

  const handleBorrow = async () => {
    if (!session) {
      toast.error("Please login to borrow books");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Book borrowed successfully!");
        setIsBorrowed(true);
      } else {
        toast.error(data.error || "Failed to borrow book");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/borrow/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Book returned successfully!");
        setIsBorrowed(false);
      } else {
        toast.error(data.error || "Failed to return book");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const actionButtons = (
    <>
      <button
        onClick={handleReadOnline}
        onMouseEnter={handlePrefetch}
        disabled={!book.pdfUrl}
        className="w-full py-3.5 min-h-[48px] bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
      >
        <BookOpen className="w-4 h-4" />
        {book.pdfUrl ? "Read Online" : "No PDF Available"}
      </button>

      {session && !isBorrowed && (
        <button
          onClick={handleBorrow}
          disabled={actionLoading}
          className="w-full py-3 min-h-[44px] bg-green-600 text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-green-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {actionLoading ? "Processing..." : "Borrow Book"}
        </button>
      )}

      {session && isBorrowed && (
        <button
          onClick={handleReturn}
          disabled={actionLoading}
          className="w-full py-3 min-h-[44px] bg-amber-500 text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-amber-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {actionLoading ? "Processing..." : "Return Book"}
        </button>
      )}

      <button
        onClick={handleDownloadPdf}
        disabled={!book.pdfUrl}
        className="w-full py-3 min-h-[44px] bg-surface border border-border text-text-primary text-sm font-semibold rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </button>

      {isUploader && (
        <button
          onClick={handleDelete}
          className="w-full py-3 min-h-[44px] bg-white border border-red-200 text-error text-sm font-semibold rounded-[var(--radius-md)] hover:bg-error-bg transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Book
        </button>
      )}
    </>
  );

  return (
    <>
      <PageContainer className="space-y-6 sm:space-y-8 pb-24 lg:pb-8">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="aspect-[2/3] w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[320px] mx-auto rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lg)] bg-[var(--border)]">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent-muted">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-accent opacity-30" />
                  </div>
                )}
              </div>

              <div className="hidden lg:block max-w-[320px] mx-auto space-y-3">
                {actionButtons}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="lg:col-span-2 space-y-5 sm:space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-base sm:text-lg text-text-secondary mt-1.5">by {book.author}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: User, label: "Author", value: book.author },
                { icon: User, label: "Uploaded By", value: uploaderName },
                {
                  icon: Calendar,
                  label: "Added On",
                  value: new Date(book.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                },
              ].map((meta) => (
                <div
                  key={meta.label}
                  className="p-4 bg-surface border border-border rounded-[var(--radius-md)] shadow-[var(--shadow-xs)]"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <meta.icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary break-words">{meta.value}</p>
                </div>
              ))}
            </div>

            <div className="lg:hidden space-y-3 pt-2 border-t border-border">
              {session && !isBorrowed && (
                <button
                  onClick={handleBorrow}
                  disabled={actionLoading}
                  className="w-full py-3 min-h-[44px] bg-green-600 text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-green-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {actionLoading ? "Processing..." : "Borrow Book"}
                </button>
              )}

              {session && isBorrowed && (
                <button
                  onClick={handleReturn}
                  disabled={actionLoading}
                  className="w-full py-3 min-h-[44px] bg-amber-500 text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-amber-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {actionLoading ? "Processing..." : "Return Book"}
                </button>
              )}
              <button
                onClick={handleDownloadPdf}
                disabled={!book.pdfUrl}
                className="w-full py-3 min-h-[44px] bg-surface border border-border text-text-primary text-sm font-semibold rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              {isUploader && (
                <button
                  onClick={handleDelete}
                  className="w-full py-3 min-h-[44px] bg-white border border-red-200 text-error text-sm font-semibold rounded-[var(--radius-md)] hover:bg-error-bg transition-colors cursor-pointer flex justify-center items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Book
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </PageContainer>

      {/* Mobile sticky read CTA */}
      {book.pdfUrl && (
        <div className="mobile-book-actions lg:hidden">
          <button
            onClick={handleReadOnline}
            onMouseEnter={handlePrefetch}
            className="w-full py-3.5 min-h-[48px] bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors shadow-sm flex justify-center items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Read Online
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import toast from "react-hot-toast";
import PixelLoader from "./ui/PixelLoader";

export default function BookReader({ bookId }) {
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    setFetching(true);
    fetch(`/api/books/${bookId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!data.pdfUrl) {
          toast.error("No PDF available for this book");
          router.replace(`/books/${bookId}`);
          return;
        }
        setBook(data);
      })
      .catch(() => {
        toast.error("Book not found");
        router.replace("/");
      })
      .finally(() => setFetching(false));
  }, [bookId, router]);

  useEffect(() => {
    if (!book?.pdfUrl) return;

    setIsLoaded(false);
    setLoadProgress(10);

    const progressTimer = setInterval(() => {
      setLoadProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 10));
    }, 300);

    const fallbackTimer = setTimeout(() => {
      setLoadProgress(100);
      setIsLoaded(true);
    }, 12000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fallbackTimer);
    };
  }, [book?.pdfUrl]);

  const handleIframeLoad = () => {
    setLoadProgress(100);
    setTimeout(() => setIsLoaded(true), 150);
  };

  const handleOpenNewTab = () => {
    if (book?.pdfUrl) window.open(book.pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    if (!book?.pdfUrl) return;
    const link = document.createElement("a");
    link.href = book.pdfUrl;
    link.download = `${book.title}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (fetching || !book) {
    return (
      <div className="min-h-[100dvh] reader-canvas flex flex-col">
        <header className="reader-header shrink-0">
          <Link href="/" className="reader-back-btn">
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Library</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="reader-loading-card w-full max-w-sm p-8 sm:p-10 text-center">
            <PixelLoader message="Fetching book" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] reader-canvas flex flex-col">
      <header className="reader-header shrink-0 !flex-col sm:!flex-row !items-stretch sm:!items-center gap-2.5 sm:gap-3">
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <Link href={`/books/${bookId}`} className="reader-back-btn shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:hidden shrink-0">
            <button type="button" onClick={handleOpenNewTab} className="reader-action-btn !p-2.5" aria-label="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleDownload} className="reader-action-btn !p-2.5" aria-label="Download">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden sm:block min-w-0 flex-1 border-l border-border pl-4">
            <h1 className="text-sm font-bold text-text-primary truncate">{book.title}</h1>
            <p className="text-xs text-text-muted truncate">by {book.author}</p>
          </div>
        </div>

        <div className="sm:hidden min-w-0 text-center px-1">
          <h1 className="text-sm font-bold text-text-primary truncate">{book.title}</h1>
          <p className="text-xs text-text-muted truncate">by {book.author}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleOpenNewTab} className="reader-action-btn">
            <ExternalLink className="w-3.5 h-3.5" />
            New Tab
          </button>
          <button type="button" onClick={handleDownload} className="reader-action-btn">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </header>

      <div className="flex-1 relative min-h-0 reader-viewport">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 reader-canvas">
            <div className="reader-loading-card w-full max-w-md p-6 sm:p-10">
              <div className="text-center mb-5 sm:mb-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent mb-2">
                  Now Reading
                </p>
                <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-2">{book.title}</h2>
                <p className="text-sm text-text-muted mt-1">{book.author}</p>
              </div>

              <PixelLoader message="Turning pages" />

              <div className="mt-6 sm:mt-8">
                <div className="reader-progress-track">
                  <div
                    className="reader-progress-fill"
                    style={{ width: `${Math.min(loadProgress, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-[10px] font-mono text-text-muted">
                  {Math.round(Math.min(loadProgress, 99))}% loaded
                </p>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={`${book.pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
          title={`Read ${book.title}`}
          onLoad={handleIframeLoad}
          className={`absolute inset-0 w-full h-full border-0 bg-white transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>
    </div>
  );
}

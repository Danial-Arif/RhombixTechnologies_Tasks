"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadBookModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) {
      setError("Title and author are required.");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    if (coverFile) formData.append("coverFile", coverFile);
    if (pdfFile) formData.append("pdfFile", pdfFile);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      toast.success("Book uploaded successfully");
      onSuccess(data.book);

      // Reset form
      setTitle("");
      setAuthor("");
      setCoverFile(null);
      setPdfFile(null);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="bg-surface w-full sm:max-w-md rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-2xl overflow-hidden border border-border max-h-[92dvh] flex flex-col"
        >
          <div className="sm:hidden w-10 h-1 rounded-full bg-border mx-auto mt-3 shrink-0" />
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">Upload a Book</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors cursor-pointer text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {error && (
              <div className="p-3 bg-error-bg text-error text-xs font-medium rounded-md border border-error/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--surface-hover)] border border-border rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
                  placeholder="e.g., The Great Gatsby"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--surface-hover)] border border-border rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
                  placeholder="e.g., F. Scott Fitzgerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cover File */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Cover Image
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] hover:border-accent/40 transition-colors cursor-pointer relative overflow-hidden">
                    {coverFile ? (
                      <div className="text-center p-2">
                        <ImageIcon className="w-6 h-6 text-accent mx-auto mb-1" />
                        <span className="text-[10px] text-text-primary font-medium truncate block w-32">
                          {coverFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                        <span className="text-[10px] text-text-secondary">Upload Image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* PDF File */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    PDF Document
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] hover:border-accent/40 transition-colors cursor-pointer relative overflow-hidden">
                    {pdfFile ? (
                      <div className="text-center p-2">
                        <FileText className="w-6 h-6 text-accent mx-auto mb-1" />
                        <span className="text-[10px] text-text-primary font-medium truncate block w-32">
                          {pdfFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                        <span className="text-[10px] text-text-secondary">Upload PDF</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-accent-hover transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Uploading..." : "Upload Book"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

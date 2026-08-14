"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Globe,
  Video,
  FileText,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPdf: (file: File, title?: string) => Promise<unknown>;
  onImportWebsite: (url: string, title?: string) => Promise<unknown>;
  onImportYoutube: (url: string, title?: string) => Promise<unknown>;
  onCreateTextSource: (title: string, content: string) => Promise<unknown>;
}

type TabType = "pdf" | "website" | "youtube" | "text";

export function AddSourceDialog({
  isOpen,
  onClose,
  onUploadPdf,
  onImportWebsite,
  onImportYoutube,
  onCreateTextSource,
}: AddSourceDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setPdfFile(null);
    setPdfTitle("");
    setWebUrl("");
    setWebTitle("");
    setYoutubeUrl("");
    setYoutubeTitle("");
    setTextTitle("");
    setTextContent("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "pdf") {
        if (!pdfFile) {
          setError("Please select a PDF file.");
          setIsLoading(false);
          return;
        }
        await onUploadPdf(pdfFile, pdfTitle.trim() || undefined);
      } else if (activeTab === "website") {
        if (!webUrl.trim()) {
          setError("Please enter a valid website URL.");
          setIsLoading(false);
          return;
        }
        await onImportWebsite(webUrl.trim(), webTitle.trim() || undefined);
      } else if (activeTab === "youtube") {
        if (!youtubeUrl.trim()) {
          setError("Please enter a valid YouTube video URL.");
          setIsLoading(false);
          return;
        }
        await onImportYoutube(youtubeUrl.trim(), youtubeTitle.trim() || undefined);
      } else if (activeTab === "text") {
        if (!textTitle.trim() || !textContent.trim()) {
          setError("Please enter both a title and text content.");
          setIsLoading(false);
          return;
        }
        await onCreateTextSource(textTitle.trim(), textContent.trim());
      }
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add source. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-zinc-300" />
            <h2 className="text-base font-semibold text-white">Add Source to Notebook</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 border-b border-zinc-800 bg-zinc-950/60 p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pdf");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              activeTab === "pdf"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>PDF Upload</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("website");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              activeTab === "website"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("youtube");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              activeTab === "youtube"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            )}
          >
            <Video className="w-3.5 h-3.5" />
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors",
              activeTab === "text"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-950/50 border border-red-900/50 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* PDF Tab */}
          {activeTab === "pdf" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFile(file);
                    if (!pdfTitle) setPdfTitle(file.name.replace(/\.pdf$/i, ""));
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[140px]",
                  pdfFile
                    ? "border-zinc-500 bg-zinc-800/30"
                    : "border-zinc-700 hover:border-zinc-500 bg-zinc-950/40 hover:bg-zinc-900/40"
                )}
              >
                <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                {pdfFile ? (
                  <div>
                    <p className="text-xs font-medium text-white">{pdfFile.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB - Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      Click to upload or drag &amp; drop a PDF
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      PDF files up to 20MB supported
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g., Quantum Computing Whitepaper"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          )}

          {/* Website Tab */}
          {activeTab === "website" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Web Page URL</label>
                <input
                  type="url"
                  required
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder="e.g., AI Research Article"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">YouTube Video URL</label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="e.g., Lecture on Deep Learning"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Note Title</label>
                <input
                  type="text"
                  required
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g., Meeting Notes / Key Highlights"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Text Content / Markdown</label>
                <textarea
                  rows={6}
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste article text, raw markdown, lecture notes..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Import Source</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

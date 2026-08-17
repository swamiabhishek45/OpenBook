"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Globe,
  FileText,
  FileCode,
  X,
  Plus,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";
import {
  useCreateSource,
  useImportWebsiteSource,
  useImportYoutubeSource,
  useUploadPdfSource,
} from "../hooks/use-sources";

export interface AddSourceDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  workspaceId?: string;
  onUploadPdf?: (file: File, title?: string) => Promise<unknown>;
  onImportWebsite?: (url: string, title?: string) => Promise<unknown>;
  onImportYoutube?: (url: string, title?: string) => Promise<unknown>;
  onCreateTextSource?: (title: string, content: string) => Promise<unknown>;
}

type TabType = "pdf" | "website" | "youtube" | "text" | "markdown";

export function AddSourceDialog({
  isOpen,
  onClose,
  open,
  onOpenChange,
  workspaceId,
  onUploadPdf,
  onImportWebsite,
  onImportYoutube,
  onCreateTextSource,
}: AddSourceDialogProps) {
  const isDialogOpen = open !== undefined ? open : (isOpen || false);

  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook-based mutations if workspaceId is supplied
  const uploadPdfMutation = useUploadPdfSource(workspaceId || "");
  const importWebsiteMutation = useImportWebsiteSource(workspaceId || "");
  const importYoutubeMutation = useImportYoutubeSource(workspaceId || "");
  const createSourceMutation = useCreateSource(workspaceId || "");

  // Form states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [markdownTitle, setMarkdownTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isDialogOpen) return null;

  const resetForm = () => {
    setPdfFile(null);
    setPdfTitle("");
    setWebUrl("");
    setWebTitle("");
    setYoutubeUrl("");
    setYoutubeTitle("");
    setTextTitle("");
    setTextContent("");
    setMarkdownTitle("");
    setMarkdownContent("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
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
        if (onUploadPdf) {
          await onUploadPdf(pdfFile, pdfTitle.trim() || undefined);
        } else if (workspaceId) {
          await uploadPdfMutation.mutateAsync({
            file: pdfFile,
            title: pdfTitle.trim() || undefined,
          });
        }
      } else if (activeTab === "website") {
        if (!webUrl.trim()) {
          setError("Please enter a valid website URL.");
          setIsLoading(false);
          return;
        }
        if (onImportWebsite) {
          await onImportWebsite(webUrl.trim(), webTitle.trim() || undefined);
        } else if (workspaceId) {
          await importWebsiteMutation.mutateAsync({
            url: webUrl.trim(),
            title: webTitle.trim() || undefined,
          });
        }
      } else if (activeTab === "youtube") {
        if (!youtubeUrl.trim()) {
          setError("Please enter a valid YouTube video URL.");
          setIsLoading(false);
          return;
        }
        if (onImportYoutube) {
          await onImportYoutube(youtubeUrl.trim(), youtubeTitle.trim() || undefined);
        } else if (workspaceId) {
          await importYoutubeMutation.mutateAsync({
            url: youtubeUrl.trim(),
            title: youtubeTitle.trim() || undefined,
          });
        }
      } else if (activeTab === "text") {
        if (!textTitle.trim() || !textContent.trim()) {
          setError("Please enter both a title and text content.");
          setIsLoading(false);
          return;
        }
        if (onCreateTextSource) {
          await onCreateTextSource(textTitle.trim(), textContent.trim());
        } else if (workspaceId) {
          await createSourceMutation.mutateAsync({
            type: "TEXT",
            title: textTitle.trim(),
            content: textContent.trim(),
          });
        }
      } else if (activeTab === "markdown") {
        if (!markdownTitle.trim() || !markdownContent.trim()) {
          setError("Please enter both a title and markdown content.");
          setIsLoading(false);
          return;
        }
        if (workspaceId) {
          await createSourceMutation.mutateAsync({
            type: "MARKDOWN",
            title: markdownTitle.trim(),
            content: markdownContent.trim(),
          });
        } else if (onCreateTextSource) {
          await onCreateTextSource(markdownTitle.trim(), markdownContent.trim());
        }
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fadeIn text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Add Source to Notebook</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-5 border-b border-border bg-muted/40 p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pdf");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === "pdf"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("website");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === "website"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === "youtube"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === "text"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("markdown");
              setError(null);
            }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === "markdown"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
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
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-32",
                  pdfFile
                    ? "border-primary bg-muted/40"
                    : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30"
                )}
              >
                <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                {pdfFile ? (
                  <div>
                    <p className="text-xs font-medium text-foreground">{pdfFile.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB - Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Click to upload or drag &amp; drop a PDF
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      PDF files up to 20MB supported
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g., Quantum Computing Whitepaper"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Website Tab */}
          {activeTab === "website" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Web Page URL</label>
                <input
                  type="url"
                  required
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder="e.g., AI Research Article"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">YouTube Video URL</label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="e.g., Lecture on Deep Learning"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Note Title</label>
                <input
                  type="text"
                  required
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g., Meeting Notes / Key Highlights"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Text Content</label>
                <textarea
                  rows={6}
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste article text, raw notes, or highlights..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Markdown Tab */}
          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Document Title</label>
                <input
                  type="text"
                  required
                  value={markdownTitle}
                  onChange={(e) => setMarkdownTitle(e.target.value)}
                  placeholder="e.g., Architecture Overview.md"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Markdown Content</label>
                <textarea
                  rows={6}
                  required
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="# Heading&#10;&#10;Write markdown documentation here..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-foreground hover:opacity-90 text-background text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              {isLoading ? <ThemeLoader size={16} /> : null}
              <span>Import Source</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

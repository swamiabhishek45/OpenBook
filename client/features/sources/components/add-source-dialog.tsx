"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Globe,
  FileText,
  X,
  Plus,
  FolderOpen,
  BookOpen,
  Search,
  Check,
  HelpCircle,
} from "lucide-react";

import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";
import {
  useCreateSource,
  useImportWebsiteSource,
  useImportYoutubeSource,
  useUploadPdfSource,
  useImportGoogleDriveSource,
  useImportNotionSource,
} from "../hooks/use-sources";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { NotionTokenGuideModal } from "./notion-token-guide-modal";


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

type TabType =
  | "pdf"
  | "website"
  | "youtube"
  | "text"
  | "google-drive"
  | "notion";

const FORM_CONTROL_CLASSNAME =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const TAB_CLASSNAME =
  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors";

const SOURCE_TABS: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: "pdf", label: "PDF", icon: <Upload className="size-3.5" /> },
  { id: "google-drive", label: "Google Drive", icon: <FolderOpen className="size-3.5" /> },
  { id: "notion", label: "Notion", icon: <BookOpen className="size-3.5" /> },
  { id: "website", label: "Web URL", icon: <Globe className="size-3.5" /> },
  { id: "youtube", label: "YouTube", icon: <YoutubeIcon size={14} /> },
  { id: "text", label: "Text", icon: <FileText className="size-3.5" /> },
];

interface IntegrationsStatus {
  googleDrive: {
    connected: boolean;
    account?: { metadata?: { email?: string; name?: string } } | null;
  };
  notion: {
    connected: boolean;
    account?: { metadata?: { workspaceName?: string } } | null;
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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

  // Hook-based mutations
  const uploadPdfMutation = useUploadPdfSource(workspaceId || "");
  const importWebsiteMutation = useImportWebsiteSource(workspaceId || "");
  const importYoutubeMutation = useImportYoutubeSource(workspaceId || "");
  const createSourceMutation = useCreateSource(workspaceId || "");
  const importGoogleDriveMutation = useImportGoogleDriveSource(workspaceId || "");
  const importNotionMutation = useImportNotionSource(workspaceId || "");

  // Form states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  // Integration specific states
  const [driveSearch, setDriveSearch] = useState("");
  const [selectedDriveFileId, setSelectedDriveFileId] = useState<string | null>(null);
  const [notionSearch, setNotionSearch] = useState("");
  const [selectedNotionPageId, setSelectedNotionPageId] = useState<string | null>(null);
  const [notionTokenInput, setNotionTokenInput] = useState("");
  const [isConnectingNotion, setIsConnectingNotion] = useState(false);
  const [showNotionHelp, setShowNotionHelp] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query connected integrations
  const { data: integrations, refetch: refetchIntegrations } = useQuery<IntegrationsStatus>({
    queryKey: ["connected-integrations"],
    queryFn: () => apiClient<IntegrationsStatus>("/api/integrations"),
    enabled: isDialogOpen,
  });

  // Query Drive files when Google Drive tab is active and connected
  const {
    data: driveFilesData,
    isLoading: isLoadingDriveFiles,
  } = useQuery<{
    files: Array<{
      id: string;
      name: string;
      mimeType: string;
      size: number | null;
      type: "GOOGLE_DOC" | "PDF";
      modifiedTime: string;
    }>;
  }>({
    queryKey: ["google-drive-files", driveSearch],
    queryFn: () =>
      apiClient(`/api/integrations/google-drive/files?search=${encodeURIComponent(driveSearch)}`),
    enabled: isDialogOpen && activeTab === "google-drive" && !!integrations?.googleDrive?.connected,
  });

  // Query Notion pages when Notion tab is active and connected
  const {
    data: notionPagesData,
    isLoading: isLoadingNotionPages,
    refetch: refetchNotionPages,
  } = useQuery<{
    pages: Array<{
      id: string;
      title: string;
      icon: string | null;
      lastEditedTime: string;
    }>;
  }>({
    queryKey: ["notion-pages", notionSearch],
    queryFn: () =>
      apiClient(`/api/integrations/notion/pages?search=${encodeURIComponent(notionSearch)}`),
    enabled: isDialogOpen && activeTab === "notion" && !!integrations?.notion?.connected,
  });

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
    setSelectedDriveFileId(null);
    setSelectedNotionPageId(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleConnectGoogleDrive = async () => {
    try {
      const res = await apiClient<{ url: string }>("/api/integrations/google-drive/auth-url");
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to get Google Drive auth URL."));
    }
  };

  const handleConnectNotionToken = async () => {
    if (!notionTokenInput.trim()) {
      setError("Please enter a Notion internal integration token.");
      return;
    }
    setIsConnectingNotion(true);
    setError(null);
    try {
      await apiClient("/api/integrations/notion/connect", {
        method: "POST",
        body: JSON.stringify({ token: notionTokenInput.trim() }),
      });
      setNotionTokenInput("");
      await refetchIntegrations();
      await refetchNotionPages();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to connect Notion token."));
    } finally {
      setIsConnectingNotion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const title = (value: string) => value.trim() || undefined;

    if (activeTab === "pdf" && !pdfFile) return setError("Please select a PDF file.");
    if (activeTab === "website" && !webUrl.trim()) return setError("Please enter a valid website URL.");
    if (activeTab === "youtube" && !youtubeUrl.trim()) return setError("Please enter a valid YouTube video URL.");
    if (activeTab === "text" && (!textTitle.trim() || !textContent.trim())) {
      return setError("Please enter both a title and text content.");
    }
    if (activeTab === "google-drive" && !selectedDriveFileId) {
      return setError("Please select a Google Doc or PDF from the list.");
    }
    if (activeTab === "notion" && !selectedNotionPageId) {
      return setError("Please select a Notion page from the list.");
    }

    setIsLoading(true);
    try {
      switch (activeTab) {
        case "pdf":
          await (onUploadPdf
            ? onUploadPdf(pdfFile!, title(pdfTitle))
            : uploadPdfMutation.mutateAsync({ file: pdfFile!, title: title(pdfTitle) }));
          break;
        case "website":
          await (onImportWebsite
            ? onImportWebsite(webUrl.trim(), title(webTitle))
            : importWebsiteMutation.mutateAsync({ url: webUrl.trim(), title: title(webTitle) }));
          break;
        case "youtube":
          await (onImportYoutube
            ? onImportYoutube(youtubeUrl.trim(), title(youtubeTitle))
            : importYoutubeMutation.mutateAsync({ url: youtubeUrl.trim(), title: title(youtubeTitle) }));
          break;
        case "text":
          await (onCreateTextSource
            ? onCreateTextSource(textTitle.trim(), textContent.trim())
            : createSourceMutation.mutateAsync({ type: "TEXT", title: textTitle.trim(), content: textContent.trim() }));
          break;
        case "google-drive":
          await importGoogleDriveMutation.mutateAsync(selectedDriveFileId!);
          break;
        case "notion":
          await importNotionMutation.mutateAsync(selectedNotionPageId!);
          break;
      }
      handleClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add source. Please try again."));
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
            <h2 className="text-sm font-semibold text-foreground">Add Source to OpenBook</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-border bg-muted/40 px-6 pt-2 gap-1 overflow-x-auto select-none">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
              }}
              className={cn(
                TAB_CLASSNAME,
                activeTab === tab.id
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-fadeIn">
              {error}
            </div>
          )}

          {/* 1. PDF Upload */}
          {activeTab === "pdf" && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2",
                  pdfFile
                    ? "border-foreground bg-muted/30"
                    : "border-border hover:border-zinc-400 hover:bg-muted/20"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfFile(file);
                      if (!pdfTitle) setPdfTitle(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                />
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-xs font-medium text-foreground">
                  {pdfFile ? pdfFile.name : "Click to browse or drop your PDF here"}
                </div>
                <div className="text-[11px] text-muted-foreground">Up to 25MB</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Source Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Research Paper"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>
            </div>
          )}

          {/* 2. Google Drive */}
          {activeTab === "google-drive" && (
            <div className="space-y-4">
              {!integrations?.googleDrive?.connected ? (
                <div className="p-8 text-center border border-border rounded-2xl bg-muted/20 space-y-4">
                  <FolderOpen className="w-10 h-10 mx-auto text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-foreground">
                      Connect your Google Drive
                    </h3>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Import Google Docs and PDFs directly into your notebook sources with 1 click.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectGoogleDrive}
                    className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    Connect Google Drive
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Google Drive docs & PDFs..."
                      value={driveSearch}
                      onChange={(e) => setDriveSearch(e.target.value)}
                      className={cn(FORM_CONTROL_CLASSNAME, "pl-8 pr-3")}
                    />
                  </div>


                  <div className="max-h-52 overflow-y-auto border border-border rounded-xl divide-y divide-border bg-card">
                    {isLoadingDriveFiles ? (
                      <div className="p-6 text-center">
                        <ThemeLoader size={20} />
                      </div>
                    ) : driveFilesData?.files && driveFilesData.files.length > 0 ? (
                      driveFilesData.files.map((file) => {
                        const isSelected = selectedDriveFileId === file.id;
                        return (
                          <div
                            key={file.id}
                            onClick={() => setSelectedDriveFileId(file.id)}
                            className={cn(
                              "p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors",
                              isSelected
                                ? "bg-muted font-semibold text-foreground"
                                : "hover:bg-muted/40 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] uppercase font-mono text-muted-foreground">
                                {file.type === "GOOGLE_DOC" ? "Doc" : "PDF"}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No Google Docs or PDFs found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Notion */}
          {activeTab === "notion" && (
            <div className="space-y-4">
              {!integrations?.notion?.connected ? (
                <div className="p-6 border border-border rounded-2xl bg-muted/20 space-y-4 relative">
                  {/* Corner Help Button */}
                  <button
                    type="button"
                    onClick={() => setShowNotionHelp(true)}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    title="How to get Notion token?"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  <div className="text-center space-y-1">
                    <BookOpen className="w-8 h-8 mx-auto text-muted-foreground" />
                    <h3 className="text-xs font-bold text-foreground">
                      Connect your Notion Workspace
                    </h3>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Paste your Notion Internal Integration Token to browse and import your Notion pages.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={notionTokenInput}
                      onChange={(e) => setNotionTokenInput(e.target.value)}
                      className={cn(FORM_CONTROL_CLASSNAME, "font-mono")}
                    />
                    <button
                      type="button"
                      onClick={handleConnectNotionToken}
                      disabled={isConnectingNotion}
                      className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isConnectingNotion ? <ThemeLoader size={14} /> : "Connect Notion Token"}
                    </button>
                  </div>

                  {/* Notion Token Help Popup Modal */}
                  <NotionTokenGuideModal
                    isOpen={showNotionHelp}
                    onClose={() => setShowNotionHelp(false)}
                  />
                </div>
              ) : (


                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Notion pages..."
                      value={notionSearch}
                      onChange={(e) => setNotionSearch(e.target.value)}
                      className={cn(FORM_CONTROL_CLASSNAME, "pl-8 pr-3")}
                    />
                  </div>


                  <div className="max-h-52 overflow-y-auto border border-border rounded-xl divide-y divide-border bg-card">
                    {isLoadingNotionPages ? (
                      <div className="p-6 text-center">
                        <ThemeLoader size={20} />
                      </div>
                    ) : notionPagesData?.pages && notionPagesData.pages.length > 0 ? (
                      notionPagesData.pages.map((page) => {
                        const isSelected = selectedNotionPageId === page.id;
                        return (
                          <div
                            key={page.id}
                            onClick={() => setSelectedNotionPageId(page.id)}
                            className={cn(
                              "p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors",
                              isSelected
                                ? "bg-muted font-semibold text-foreground"
                                : "hover:bg-muted/40 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm shrink-0">{page.icon || "📄"}</span>
                              <span className="truncate">{page.title}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No accessible Notion pages found. Please ensure your integration is invited to the pages.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Website URL */}
          {activeTab === "website" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom title"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>
            </div>
          )}

          {/* 5. YouTube URL */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom video title"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>
            </div>
          )}

          {/* 6. Raw Text */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1 Notes"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  className={FORM_CONTROL_CLASSNAME}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your text content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className={cn(FORM_CONTROL_CLASSNAME, "font-mono")}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                (activeTab === "google-drive" && !selectedDriveFileId) ||
                (activeTab === "notion" && !selectedNotionPageId)
              }
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <ThemeLoader size={14} />
                  <span>Importing Source...</span>
                </>
              ) : (
                <span>Add Source</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

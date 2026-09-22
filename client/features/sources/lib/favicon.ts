import type { Source } from "./types";

function resolvePageUrl(source: Source): string | null {
  if (source.url?.trim()) {
    return source.url.trim();
  }
  const imported = source.metadata?.importedFrom;
  if (typeof imported === "string" && imported.trim()) {
    return imported.trim();
  }
  return null;
}

/**
 * Favicon URL for WEBSITE sources (metadata or derived from page URL).
 */
export function getWebsiteFaviconUrl(source: Source): string | null {
  if (source.type !== "WEBSITE") {
    return null;
  }

  const fromMeta = source.metadata?.faviconUrl;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta.trim();
  }

  const pageUrl = resolvePageUrl(source);
  if (!pageUrl) {
    return null;
  }

  try {
    const hostname = new URL(pageUrl).hostname;
    if (!hostname) {
      return null;
    }
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return null;
  }
}

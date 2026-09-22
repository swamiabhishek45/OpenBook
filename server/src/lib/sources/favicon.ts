/**
 * Builds a stable favicon URL for a page URL (Google favicon service).
 */
export function buildFaviconUrl(pageUrl: string): string | null {
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

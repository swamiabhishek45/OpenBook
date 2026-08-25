import { fetchTranscript as fetchTranscriptPlus, YoutubeTranscript as YoutubeTranscriptPlus } from "youtube-transcript-plus";
import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../../types/app-error.js";
import { Firecrawl } from "firecrawl";

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
];

/**
 * Selects a random modern browser User-Agent string from the pool.
 *
 * @returns Random user agent string
 */
function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Decodes HTML entities commonly found in raw YouTube caption XML responses.
 *
 * @param str - Raw string containing HTML entities
 * @returns Decoded plain text string
 */
function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .trim();
}

/**
 * Extracts the 11-character YouTube video identifier from standard URLs, short links, or embed paths.
 *
 * @param url - YouTube URL or raw video ID
 * @returns 11-character video ID string, or null if invalid
 */
function extractYouTubeVideoId(url: string): string | null {
    if (!url || typeof url !== "string") return null;

    const trimmed = url.trim();

    // Direct 11-char video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    try {
        // Try standard URL parsing
        const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.searchParams.has("v")) {
                const v = parsed.searchParams.get("v");
                if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
            }

            const match = parsed.pathname.match(/\/(?:embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
            if (match?.[1]) return match[1];
        }

        if (parsed.hostname === "youtu.be") {
            const id = parsed.pathname.slice(1).split("/")[0]?.split("?")[0];
            if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
    } catch {
        // Fallback to regex
    }

    const regexMatch = trimmed.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/,
    );

    return regexMatch?.[1] ?? null;
}

/**
 * Fetches the video title via YouTube's public oEmbed endpoint.
 *
 * @param videoId - 11-character YouTube video ID
 * @returns Video title string or null if unavailable
 */
async function fetchYoutubeTitle(videoId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
            {
                headers: {
                    "User-Agent": getRandomUserAgent(),
                },
            },
        );
        if (!response.ok) return null;
        const data = (await response.json()) as { title?: string };
        return data.title?.trim() || null;
    } catch {
        return null;
    }
}

/**
 * Strategy 1: Attempts transcript extraction via youtube-transcript-plus.
 *
 * @param videoId - 11-character YouTube video ID
 * @param lang - Optional language code
 * @returns Object with transcript content and title, or null
 */
async function tryFetchTranscriptPlus(videoId: string, lang?: string): Promise<{ content: string; title?: string } | null> {
    try {
        const result = await fetchTranscriptPlus(videoId, {
            lang,
            userAgent: getRandomUserAgent(),
            retries: 2,
            retryDelay: 1000,
            videoDetails: true,
        });

        if (result && "segments" in result && Array.isArray(result.segments) && result.segments.length > 0) {
            const text = result.segments.map((s: { text: string }) => s.text).join(" ").trim();
            if (text) {
                return {
                    content: decodeHtmlEntities(text),
                    title: result.videoDetails?.title,
                };
            }
        }
    } catch {
        // Fall through
    }
    return null;
}

/**
 * Strategy 2: Attempts transcript extraction via legacy youtube-transcript package.
 *
 * @param videoId - 11-character YouTube video ID
 * @returns Decoded transcript text string or null
 */
async function tryFetchYoutubeTranscript(videoId: string): Promise<string | null> {
    try {
        const segments = await YoutubeTranscript.fetchTranscript(videoId);
        if (Array.isArray(segments) && segments.length > 0) {
            const text = segments.map((s) => s.text).join(" ").trim();
            return text ? decodeHtmlEntities(text) : null;
        }
    } catch {
        // Fall through
    }
    return null;
}

/**
 * Strategy 3: Attempts scraping YouTube page captions via Firecrawl residential proxies.
 *
 * @param videoId - 11-character YouTube video ID
 * @returns Object with scraped text and title, or null
 */
async function tryFetchViaFirecrawl(videoId: string): Promise<{ content: string; title?: string } | null> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return null;

    try {
        const client = new Firecrawl({ apiKey });
        const res = await client.scrape(`https://www.youtube.com/watch?v=${videoId}`, {
            formats: ["markdown"],
        });

        const markdown = res.markdown?.trim();
        if (markdown && markdown.length > 100) {
            return {
                content: markdown,
                title: res.metadata?.title,
            };
        }
    } catch {
        // Non-fatal
    }
    return null;
}

/**
 * Fetches closed captions and title from a YouTube video URL using multi-strategy fallback.
 *
 * @param url - YouTube video link
 * @returns Object containing videoId, transcript content, and video title
 * @throws {ValidationError} When URL is invalid or all transcript fetch strategies fail
 */
export async function fetchYoutubeTranscript(url: string) {
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
        throw new ValidationError("Enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)");
    }

    let fetchedTitle: string | null = null;
    try {
        fetchedTitle = await fetchYoutubeTitle(videoId);
    } catch {
        // Non-fatal
    }

    // Strategy 1: youtube-transcript-plus (auto language detection + retries + rotation)
    let result = await tryFetchTranscriptPlus(videoId);

    // Strategy 2: youtube-transcript-plus (explicit 'en')
    if (!result) {
        result = await tryFetchTranscriptPlus(videoId, "en");
    }

    let content = result?.content;
    if (result?.title && !fetchedTitle) {
        fetchedTitle = result.title;
    }

    // Strategy 3: legacy youtube-transcript
    if (!content) {
        content = (await tryFetchYoutubeTranscript(videoId)) ?? undefined;
    }

    // Strategy 4: Firecrawl residential proxy scraper (bypasses datacenter/cloud IP blocks on Railway)
    if (!content) {
        const firecrawlResult = await tryFetchViaFirecrawl(videoId);
        if (firecrawlResult) {
            content = firecrawlResult.content;
            if (firecrawlResult.title && !fetchedTitle) {
                fetchedTitle = firecrawlResult.title;
            }
        }
    }

    if (!content) {
        throw new ValidationError(
            "Could not fetch transcript. YouTube may have blocked access from this server, or closed captions are disabled on this video.",
        );
    }

    return { videoId, content, title: fetchedTitle };
}
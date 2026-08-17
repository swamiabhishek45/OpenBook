import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../../types/app-error.js";

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

async function fetchYoutubeTitle(videoId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        );
        if (!response.ok) return null;
        const data = (await response.json()) as { title?: string };
        return data.title?.trim() || null;
    } catch {
        return null;
    }
}

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

    try {
        const segments = await YoutubeTranscript.fetchTranscript(videoId);
        const content = segments.map((segment) => segment.text).join(" ").trim();

        if (!content) {
            throw new ValidationError(
                "No transcript found for this video. The video may not have captions.",
            );
        }

        return { videoId, content, title: fetchedTitle };
    } catch (err: unknown) {
        if (err instanceof ValidationError) throw err;
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("disabled") || msg.toLowerCase().includes("transcript")) {
            throw new ValidationError(
                "Could not fetch transcript. Transcripts/captions may be disabled for this video.",
            );
        }
        throw new ValidationError(
            "Could not fetch transcript. Please ensure the video has closed captions/subtitles enabled.",
        );
    }
}
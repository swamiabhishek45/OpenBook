import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../types/app-error.js";

export async function fetchYoutubeTranscript(url: string) {
    const videoId =
        url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
        )?.[1] ?? url.match(/youtube\.com\/shorts\/([\w-]{11})/)?.[1];

    if (!videoId) {
        throw new ValidationError("Enter a valid YouTube URL");
    }

    try {
        const segments = await YoutubeTranscript.fetchTranscript(videoId);
        const content = segments.map((segment) => segment.text).join(" ").trim();

        if (!content) {
            throw new ValidationError(
                "No transcript found for this video",
            );
        }

        return { videoId, content };
    } catch {
        throw new ValidationError(
            "Could not fetch transcript. The video may not have captions.",
        );
    }
}
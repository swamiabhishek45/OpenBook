import fs from "fs";
import path from "path";
import { AppError } from "../types/app-error.js";

// Standard Premade ElevenLabs Voices (work on all tier accounts)
export const ELEVENLABS_VOICES = {
    ALEX: "pNInz6obpgDQGcFmaJgB", // Adam - deep, analytical host
    JORDAN: "Xb7hH8MSUJpSbSDYk0k2", // Alice - expressive, dynamic co-host
} as const;

export interface SpeechTurn {
    speaker: "Alex" | "Jordan";
    text: string;
}

/**
 * Synthesizes a single dialogue turn into an MP3 audio buffer using the ElevenLabs Turbo v2.5 TTS model.
 *
 * @param text - Spoken dialogue text to synthesize
 * @param voiceId - ElevenLabs voice ID to use
 * @returns Promise resolving to the MP3 audio binary buffer
 * @throws {AppError} When ELEVENLABS_API_KEY is not configured or ElevenLabs API rejects the request
 */
export async function synthesizeElevenLabsSpeech(
    text: string,
    voiceId: string,
): Promise<Buffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new AppError(
            500,
            "ELEVENLABS_API_KEY is not configured in server/.env",
        );
    }

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.15,
                    use_speaker_boost: true,
                },
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("ElevenLabs TTS Error:", response.status, errorText);
        throw new AppError(
            500,
            `ElevenLabs TTS generation failed (${response.status}): ${errorText || "API Error"}`,
        );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Iterates through dialogue turns, synthesizes audio for Alex and Jordan, and concatenates the resulting MP3 buffers.
 *
 * @param turns - Array of speech turn objects with speaker and text
 * @returns Promise resolving to concatenated MP3 audio Buffer
 * @throws {AppError} If audio synthesis fails for all turns
 */
export async function generateMultiSpeakerPodcastAudio(
    turns: SpeechTurn[],
): Promise<Buffer> {
    const audioBuffers: Buffer[] = [];

    for (const turn of turns) {
        const voiceId =
            turn.speaker === "Alex"
                ? ELEVENLABS_VOICES.ALEX
                : ELEVENLABS_VOICES.JORDAN;

        try {
            const buffer = await synthesizeElevenLabsSpeech(turn.text, voiceId);
            audioBuffers.push(buffer);
        } catch (error) {
            console.error(`Failed to synthesize turn for ${turn.speaker}:`, error);
        }
    }

    if (audioBuffers.length === 0) {
        throw new AppError(
            500,
            "Failed to synthesize podcast audio with ElevenLabs. Please verify your ElevenLabs API key.",
        );
    }

    // Direct MP3 buffer concatenation
    return Buffer.concat(audioBuffers);
}

/**
 * Saves a generated podcast MP3 buffer to the local disk fallback directory (`uploads/podcasts/`) and returns its public HTTP URL.
 *
 * @param buffer - MP3 audio binary buffer
 * @param filename - Target filename (e.g. podcast_123.mp3)
 * @returns Fully qualified public HTTP URL to access the audio file
 */
export function savePodcastAudioLocally(
    buffer: Buffer,
    filename: string,
): string {
    try {
        const uploadsDir = path.join(process.cwd(), "uploads", "podcasts");
        fs.mkdirSync(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
    } catch (err) {
        console.warn("Could not save podcast to local disk:", err);
    }

    const serverUrl =
        process.env.SERVER_URL ||
        process.env.BACKEND_URL ||
        process.env.BETTER_AUTH_URL ||
        (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:8081");

    return `${serverUrl.replace(/\/$/, "")}/uploads/podcasts/${filename}`;
}

import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client.js";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
import {
    findArtifactByIdAndWorkspaceId,
    updateArtifactRecord,
} from "../repository/artifact.repository.js";
import { gatherSourceContext } from "./artifact-generation.services.js";
import {
    generateMultiSpeakerPodcastAudio,
    savePodcastAudioLocally,
} from "../lib/elevenlabs.js";
import { uploadAudioToCloudinary } from "../lib/cloudinary.js";
import { NotFoundError, ValidationError } from "../types/app-error.js";

const interruptionSchema = z.object({
    dialogue: z
        .array(
            z.object({
                speaker: z.enum(["Alex", "Jordan"]),
                text: z.string(),
            }),
        )
        .min(2)
        .max(3),
});

export interface InterruptPodcastInput {
    artifactId: string;
    workspaceId: string;
    userId: string;
    question: string;
    timestamp: number;
}

export interface InterruptionItem {
    id: string;
    timestamp: number;
    userQuestion: string;
    audioUrl: string | null;
    dialogue: Array<{
        speaker: "Alex" | "Jordan";
        text: string;
    }>;
    createdAt: string;
}

export async function processPodcastInterruption({
    artifactId,
    workspaceId,
    userId,
    question,
    timestamp,
}: InterruptPodcastInput): Promise<InterruptionItem> {
    if (!question || !question.trim()) {
        throw new ValidationError("Question cannot be empty.");
    }

    // 1. Verify user access
    await getWorkspaceByIdForUser(workspaceId, userId);

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );

    if (!artifact) {
        throw new NotFoundError("Podcast artifact not found.");
    }

    if (artifact.type !== "PODCAST") {
        throw new ValidationError("Only podcast artifacts support interruptions.");
    }

    // 2. Gather source context for grounding
    const sourceContext = await gatherSourceContext(
        workspaceId,
        artifact.sourceIds,
    );

    // 3. Prompt AI co-hosts to answer in character
    const result = await generateText({
        model: openai(CHAT_MODEL),
        system: [
            "You are Alex and Jordan, the two AI co-hosts of the acclaimed OpenBook Deep Dive audio show.",
            "A listener just clicked 'Interrupt & Ask' at timestamp " +
                Math.floor(timestamp) +
                "s with a question.",
            "Alex: Analytical, direct, acknowledges the listener question warmly and provides the core factual answer grounded strictly in the source materials.",
            "Jordan: Dynamic, insightful, provides a concise real-world analogy or implication, and seamlessly wraps up to return to the show.",
            "CRITICAL: Keep the response natural, spoken, and punchy (1-2 short turns total, max ~40-50 words total) so the interruption is rapid and engaging.",
            "Do NOT use markdown, bullet points, asterisks, or source citations like [1].",
        ].join("\n"),
        output: Output.object({ schema: interruptionSchema }),
        prompt: `Listener Question: "${question.trim()}"\n\nGround your answer strictly in these source materials:\n${sourceContext.text}`,
    });

    const dialogueData = result.output;

    // 4. Generate audio with ElevenLabs
    let audioUrl: string | null = null;
    try {
        const mp3Buffer = await generateMultiSpeakerPodcastAudio(
            dialogueData.dialogue,
        );
        const filename = `interruption_${Date.now()}.mp3`;

        // Save locally for direct instant streaming
        audioUrl = savePodcastAudioLocally(mp3Buffer, filename);

        // Upload to Cloudinary if available
        try {
            const cloudResult = await uploadAudioToCloudinary(mp3Buffer, filename);
            if (cloudResult?.secureUrl) audioUrl = cloudResult.secureUrl;
        } catch (cloudErr) {
            console.warn("Cloudinary upload fallback for interruption:", cloudErr);
        }
    } catch (audioErr) {
        console.error("Failed to generate audio for podcast interruption:", audioErr);
    }

    // 5. Construct interruption record
    const interruptionItem: InterruptionItem = {
        id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Math.max(0, Math.round(timestamp * 10) / 10),
        userQuestion: question.trim(),
        audioUrl,
        dialogue: dialogueData.dialogue,
        createdAt: new Date().toISOString(),
    };

    // 6. Update artifact content in database
    const existingContent = (artifact.content as Record<string, unknown>) || {};
    const existingPodcast =
        (existingContent.podcast as Record<string, unknown>) || {};
    const existingInterruptions =
        (existingPodcast.interruptions as InterruptionItem[]) || [];

    const updatedContent = {
        ...existingContent,
        podcast: {
            ...existingPodcast,
            interruptions: [...existingInterruptions, interruptionItem],
        },
    };

    await updateArtifactRecord(artifactId, {
        content: updatedContent as unknown as Prisma.InputJsonValue,
    });


    return interruptionItem;
}

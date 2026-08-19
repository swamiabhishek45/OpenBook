import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { findSourcesByWorkspaceId } from "../repository/source.repository.js";
import type { ArtifactRecord } from "../repository/artifact.repository.js";
import { ValidationError } from "../types/app-error.js";
import {
    generateMultiSpeakerPodcastAudio,
    savePodcastAudioLocally,
} from "../lib/elevenlabs.js";
import { uploadAudioToCloudinary } from "../lib/cloudinary.js";


const MAX_CONTEXT_CHARS = 120_000;

const flashcardsSchema = z.object({
    cards: z
        .array(
            z.object({
                front: z.string(),
                back: z.string(),
            }),
        )
        .min(3)
        .max(30),
});

const quizSchema = z.object({
    questions: z
        .array(
            z.object({
                question: z.string(),
                options: z.array(z.string()).min(2).max(5),
                correctIndex: z.number().int().min(0),
                explanation: z.string(),
            }),
        )
        .min(3)
        .max(15),
});

const mindmapSchema = z.object({
    nodes: z
        .array(
            z.object({
                id: z.string(),
                label: z.string(),
            }),
        )
        .min(2)
        .max(40),
    edges: z.array(
        z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
        }),
    ),
});

const takeawaysSchema = z.object({
    items: z.array(z.string()).min(3).max(20),
});

const reportSchema = z.object({
    markdown: z.string(),
    sections: z.array(
        z.object({
            title: z.string(),
            content: z.string(),
        }),
    ),
});

const podcastDebateSchema = z.object({
    topic: z.string(),
    summary: z.string(),
    durationEstimate: z.string(),
    turns: z
        .array(
            z.object({
                speaker: z.enum(["Alex", "Jordan"]),
                text: z.string(),
            }),
        )
        .min(4)
        .max(14),
});

/**
 * Collects and concatenates text from READY workspace sources for artifact generation.
 *
 * @param workspaceId - Workspace whose sources to read
 * @param sourceIds - Optional subset of source ids; defaults to all READY sources
 * @returns Combined source text (max 120k chars) and the ids actually used
 * @throws {ValidationError} When no ready sources exist or none have extracted content
 */
export async function gatherSourceContext(
    workspaceId: string,
    sourceIds?: string[],
) {
    if (Array.isArray(sourceIds) && sourceIds.length === 0) {
        throw new ValidationError(
            "No sources selected. Please select at least one source to generate learning artifacts.",
        );
    }

    const sources = await findSourcesByWorkspaceId(workspaceId, {
        status: "READY",
    });

    const selected =
        sourceIds && sourceIds.length > 0
            ? sources.filter((source) => sourceIds.includes(source.id))
            : sources;

    if (selected.length === 0) {
        throw new ValidationError(
            "No matching ready sources found. Please select ready sources before generating learning tools.",
        );
    }


    const withContent = selected.flatMap((source) => {
        const content = source.content?.trim();
        return content ? [{ title: source.title, content }] : [];
    });

    if (withContent.length === 0) {
        throw new ValidationError(
            "Selected sources have no extracted content yet.",
        );
    }

    const text = withContent
        .map((source) => `# ${source.title}\n\n${source.content}`)
        .join("\n\n---\n\n")
        .slice(0, MAX_CONTEXT_CHARS);

    return {
        text,
        sourceIds: selected.map((source) => source.id),
    };
}

/**
 * Generates structured or markdown content for a learning artifact using the AI SDK.
 *
 * @param type - Artifact type (`SUMMARY`, `QUIZ`, `FLASHCARDS`, `MINDMAP`, `REPORT`, `PODCAST`)
 * @param sourceText - Combined source material from {@link gatherSourceContext}
 * @returns Type-specific JSON content stored on the artifact row
 * @throws {ValidationError} When the artifact type is unsupported
 */
export async function generateArtifactContent(
    type: ArtifactRecord["type"],
    sourceText: string,
) {
    const system = [
        `You are Chaibook, an expert learning assistant generating a ${type.toLowerCase()} from workspace source materials.`,
        "Use ONLY the provided source content. Do not invent facts not supported by the sources.",
        "Be clear, educational, and well-structured.",
    ].join("\n");

    switch (type) {
        case "SUMMARY": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                prompt: `Write a comprehensive markdown summary of the following sources:\n\n${sourceText}`,
            });
            return { markdown: result.text };
        }
        case "TAKEAWAYS": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: takeawaysSchema }),
                prompt: `Extract the most important key takeaways as clear, concise bullet points (without markdown asterisks like **bold**) from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "FLASHCARDS": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: flashcardsSchema }),
                prompt: `Create study flashcards (front/back) covering the main concepts from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "QUIZ": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: quizSchema }),
                prompt: `Create a multiple-choice quiz with explanations from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "MINDMAP": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: mindmapSchema }),
                prompt: `Generate a structured, deeply informative mind map strictly from the provided source materials.
1. The root node (id: "1") MUST be the exact central subject/title of the provided material.
2. Create 3 to 6 major theme/category nodes (e.g. id "2", "3", etc.) branching out from the root node.
3. Under each major theme node, attach 2 to 5 specific sub-branches or concept nodes detailing concrete findings, definitions, examples, or mechanisms from the text.
4. Provide all directed edges (source to target) connecting the root to the major categories, and the categories to their sub-branches.

Source material:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "REPORT": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: reportSchema }),
                prompt: `Write a structured long-form report with sections and a full markdown version from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "PODCAST": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system: [
                    "You are the executive producer of an acclaimed deep-dive audio podcast and intellectual debate show (like NotebookLM Audio Overviews).",
                    "Generate a concise 1-minute audio debate dialogue between two sharp, articulate AI hosts: Alex and Jordan.",
                    "- Alex: Analytical, inquisitive, grounded in facts, raises tough questions and examines evidence.",
                    "- Jordan: Big-picture, energetic, challenges assumptions, offers contrasting perspectives and real-world analogies.",
                    "The conversation should be conversational, engaging, and genuinely debate key ideas, trade-offs, and insights from the provided sources.",
                    "Use spoken, audio-friendly language (no markdown syntax, no bullet points, no URLs, no citations like [1]).",
                    "CRITICAL: Keep the debate strictly to 5-6 short, punchy turns (~20-25 words each, total ~130 words) so it fits into a 1-minute audio show.",
                ].join("\n"),
                output: Output.object({ schema: podcastDebateSchema }),
                prompt: `Produce a 5-6 turn, 1-minute audio debate analyzing the following source materials:\n\n${sourceText}`,
            });

            const debateData = result.output;

            // Generate multi-speaker audio with ElevenLabs
            let audioUrl: string | null = null;
            try {
                const mp3Buffer = await generateMultiSpeakerPodcastAudio(
                    debateData.turns,
                );
                const filename = `podcast_${Date.now()}.mp3`;

                // 1. Save locally for 100% reliable direct streaming
                audioUrl = savePodcastAudioLocally(mp3Buffer, filename);

                // 2. Also try uploading to Cloudinary
                try {
                    const uploadResult = await uploadAudioToCloudinary(
                        mp3Buffer,
                        filename,
                    );
                    if (uploadResult?.secureUrl) {
                        audioUrl = uploadResult.secureUrl;
                    }
                } catch {
                    // Local audioUrl already set as reliable fallback
                }
            } catch (audioErr) {
                console.error("Audio synthesis failed:", audioErr);
            }

            return {
                podcast: {
                    topic: debateData.topic,
                    summary: debateData.summary,
                    durationEstimate: "1 min",
                    audioUrl,
                    transcript: debateData.turns,
                },
            };
        }

        default:
            throw new ValidationError(`Unsupported artifact type: ${type}`);
    }
}
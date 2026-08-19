/**
 * Gemini API Integration for Fast, Free-Tier AI Operations (Titles, Summaries, Quick Labels)
 */

export async function generateArtifactTitleWithGemini(
    artifactType: string,
    sourceText: string,
    fallbackTitle?: string,
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const typeLabel =
        {
            SUMMARY: "Summary",
            TAKEAWAYS: "Key Takeaways",
            FLASHCARDS: "Flashcards",
            QUIZ: "Quiz",
            MINDMAP: "Mind Map",
            REPORT: "AI Report",
            PODCAST: "Audio Debate & Podcast",
        }[artifactType] || artifactType;

    const defaultFallback =
        fallbackTitle || `${typeLabel} · ${new Date().toLocaleDateString()}`;

    if (!apiKey || !sourceText || !sourceText.trim()) {
        return defaultFallback;
    }

    try {
        const prompt = [
            `You are a concise, smart title generator for an AI learning workbench.`,
            `The user is creating a "${typeLabel}" artifact from their study materials.`,
            `Generate a specific, descriptive, and engaging title (3 to 7 words max) that accurately reflects the core subject/topic of the source content.`,
            `Guidelines:`,
            `- Be specific to the subject (e.g., "Transformer Architecture & Attention Mechanisms", "Express.js REST APIs & Middleware", "Cellular Respiration & ATP Cycle")`,
            `- Do NOT wrap in quotation marks.`,
            `- Do NOT include words like "Title:", "A Summary of", or markdown asterisks.`,
            `- Return ONLY the clean, raw title string.`,
            ``,
            `Source Excerpt:`,
            sourceText.slice(0, 5000),
        ].join("\n");

        // Use active Google Gemini free-tier models (2.5 generation)
        const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.2,
                                maxOutputTokens: 250,
                            },
                        }),
                    },
                );

                if (response.ok) {
                    const data = (await response.json()) as {
                        candidates?: Array<{
                            content?: {
                                parts?: Array<{ text?: string }>;
                            };
                        }>;
                    };

                    const parts = data?.candidates?.[0]?.content?.parts || [];
                    // Find first non-empty text part
                    const text = parts
                        .map((p) => p.text || "")
                        .join(" ")
                        .trim();

                    if (text) {
                        // Clean up quotes, markdown asterisks, or unwanted prefixes
                        const clean = text
                            .replace(/^["'`]|["'`]$/g, "")
                            .replace(/^\*\*|\*\*$/g, "")
                            .replace(/^Title:\s*/i, "")
                            .trim();
                        if (clean.length > 2) {
                            return clean;
                        }
                    }
                } else {
                    const err = await response.text().catch(() => "");
                    console.warn(`Gemini model ${model} HTTP ${response.status}:`, err);
                }
            } catch (modelErr) {
                console.warn(`Gemini model ${model} fetch error:`, modelErr);
            }
        }
    } catch (error) {
        console.warn("Gemini title generation failed:", error);
    }

    return defaultFallback;
}

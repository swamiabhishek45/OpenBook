import { enhancePromptWithGemini } from "../lib/gemini.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";

export async function enhanceChatPromptForWorkspace(
    workspaceId: string,
    userId: string,
    prompt: string,
    sourcesCount?: number,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const enhanced = await enhancePromptWithGemini(prompt, {
        sourcesCount,
    });

    return { enhanced };
}

import prisma from "../lib/db.js";
import type { Prisma } from "../generated/prisma/client.js";

export function findFlashcardArtifactsByWorkspaceId(workspaceId: string) {
    return prisma.learningArtifact.findMany({
        where: {
            workspaceId,
            type: "FLASHCARDS",
            status: "READY",
        },
        select: {
            id: true,
            title: true,
            content: true,
            metadata: true,
            updatedAt: true,
        },
    });
}

export function findUserFlashcardArtifacts(userId: string) {
    return prisma.learningArtifact.findMany({
        where: {
            workspace: { userId },
            type: "FLASHCARDS",
            status: "READY",
        },
        select: {
            id: true,
            title: true,
            content: true,
            metadata: true,
            updatedAt: true,
        },
    });
}

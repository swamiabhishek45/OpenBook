import type { Request, Response } from "express";
import {
    createArtifactForWorkspace,
    deleteArtifactForWorkspace,
    getArtifactForWorkspace,
    listArtifactsForWorkspace,
} from "../services/artifact.services.js";
import { processPodcastInterruption } from "../services/podcast-interruption.services.js";
import {
    getDueFlashcardsForWorkspace,
    reviewFlashcard,
} from "../services/srs.services.js";
import {
    artifactIdParamSchema,
    createArtifactSchema,
} from "../validators/artifact.validator.js";
import { reviewFlashcardSchema } from "../validators/srs.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";

export async function listArtifacts(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const artifacts = await listArtifactsForWorkspace(
        workspaceId,
        req.session.user.id,
    );
    res.json(artifacts);
}

export async function getArtifact(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const artifact = await getArtifactForWorkspace(
        workspaceId,
        artifactId,
        req.session.user.id,
    );
    res.json(artifact);
}

export async function createArtifact(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = createArtifactSchema.parse(req.body);
    const artifact = await createArtifactForWorkspace(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(artifact);
}

export async function deleteArtifact(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    await deleteArtifactForWorkspace(
        workspaceId,
        artifactId,
        req.session.user.id,
    );
    res.status(204).send();
}

export async function interruptPodcast(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const { question, timestamp } = req.body;

    const interruption = await processPodcastInterruption({
        artifactId,
        workspaceId,
        userId: req.session.user.id,
        question: String(question || ""),
        timestamp: Number(timestamp || 0),
    });

    res.json(interruption);
}

export async function reviewFlashcardController(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const { cardIndex, rating } = reviewFlashcardSchema.parse(req.body);

    const result = await reviewFlashcard({
        workspaceId,
        artifactId,
        userId: req.session.user.id,
        cardIndex,
        rating,
    });

    res.json(result);
}

export async function getDueFlashcardsController(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);

    const dueData = await getDueFlashcardsForWorkspace(
        workspaceId,
        req.session.user.id,
    );

    res.json(dueData);
}


import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import {
    createArtifactForWorkspace,
    deleteArtifactForWorkspace,
    getArtifactForWorkspace,
    listArtifactsForWorkspace,
} from "../services/artifact.services.js";
import { processPodcastInterruption } from "../services/podcast-interruption.services.js";
import { findArtifactByIdAndWorkspaceId } from "../repository/artifact.repository.js";
import { NotFoundError } from "../types/app-error.js";
import {
    artifactIdParamSchema,
    createArtifactSchema,
} from "../validators/artifact.validator.js";
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

export async function streamPodcastAudio(req: Request, res: Response) {
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(req.params);
    const interruptionId = req.query.interruptionId as string | undefined;

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );

    if (!artifact) {
        throw new NotFoundError("Artifact not found");
    }

    const content = (artifact.content as Record<string, unknown>) || {};
    const podcast = (content.podcast as Record<string, unknown>) || {};

    let audioBase64: string | undefined;
    let audioUrl: string | undefined;

    if (interruptionId) {
        const interruptions =
            (podcast.interruptions as Array<Record<string, unknown>>) || [];
        const item = interruptions.find((i) => i.id === interruptionId);
        if (item) {
            audioBase64 = item.audioBase64 as string | undefined;
            audioUrl = item.audioUrl as string | undefined;
        }
    } else {
        audioBase64 =
            (podcast.audioBase64 as string | undefined) ||
            ((artifact.metadata as Record<string, unknown>)?.audioBase64 as string | undefined);
        audioUrl = podcast.audioUrl as string | undefined;
    }

    // 1. If audioBase64 is stored in database, stream directly with Range support
    if (audioBase64) {
        const audioBuffer = Buffer.from(audioBase64, "base64");
        const totalSize = audioBuffer.length;
        const range = req.headers.range;

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
            const chunkSize = end - start + 1;

            res.status(206);
            res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
            res.setHeader("Content-Length", chunkSize);
            res.end(audioBuffer.subarray(start, end + 1));
            return;
        }

        res.setHeader("Content-Length", totalSize);
        res.end(audioBuffer);
        return;
    }

    // 2. If audioUrl points to local file in uploads/podcasts/
    if (audioUrl && audioUrl.includes("/uploads/podcasts/")) {
        const filename = path.basename(audioUrl.split("?")[0]);
        const filePath = path.join(process.cwd(), "uploads", "podcasts", filename);
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            const totalSize = stat.size;
            const range = req.headers.range;

            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Accept-Ranges", "bytes");

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
                const chunkSize = end - start + 1;

                res.status(206);
                res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
                res.setHeader("Content-Length", chunkSize);
                fs.createReadStream(filePath, { start, end }).pipe(res);
                return;
            }

            res.setHeader("Content-Length", totalSize);
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    // 3. If external remote URL (Cloudinary / CDN), redirect
    if (audioUrl && (audioUrl.startsWith("http://") || audioUrl.startsWith("https://"))) {
        res.redirect(audioUrl);
        return;
    }

    throw new NotFoundError("Audio content not found for this podcast.");
}


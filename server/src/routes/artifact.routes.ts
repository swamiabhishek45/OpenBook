import { Router } from "express";
import {
    createArtifact,
    deleteArtifact,
    getArtifact,
    listArtifacts,
    interruptPodcast,
} from "../controllers/artifact.controller.js";
import { exportToNotion } from "../controllers/integration.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.get("/", asyncHandler(listArtifacts));
artifactRoutes.post("/", asyncHandler(createArtifact));
artifactRoutes.get("/:artifactId", asyncHandler(getArtifact));
artifactRoutes.delete("/:artifactId", asyncHandler(deleteArtifact));
artifactRoutes.post("/:artifactId/podcast/interrupt", asyncHandler(interruptPodcast));
artifactRoutes.post("/:artifactId/export/notion", asyncHandler(exportToNotion));
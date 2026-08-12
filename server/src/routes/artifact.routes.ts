import { Router } from "express";
import {
    createArtifact,
    deleteArtifact,
    getArtifact,
    listArtifacts,
} from "../controllers/artifact.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.get("/", asyncHandler(listArtifacts));
artifactRoutes.post("/", asyncHandler(createArtifact));
artifactRoutes.get("/:artifactId", asyncHandler(getArtifact));
artifactRoutes.delete("/:artifactId", asyncHandler(deleteArtifact));
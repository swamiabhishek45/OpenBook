import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
    bulkDeleteSources,
    createSource,
    deleteSource,
    getSource,
    getSourceChunks,
    importWebsite,
    importWebSearch,
    importYoutube,
    listSources,
    reprocessSource,
    reprocessSources,
    uploadPdf,
} from "../controllers/source.controller.js";
import { uploadSinglePdf } from "../middleware/upload.middleware.js";

export const sourceRoutes = Router({ mergeParams: true });

sourceRoutes.post(
    "/upload",
    uploadSinglePdf,
    asyncHandler(uploadPdf),
);

sourceRoutes.post("/import/youtube", asyncHandler(importYoutube));
sourceRoutes.post("/import/website", asyncHandler(importWebsite));
sourceRoutes.post("/import/web-search", asyncHandler(importWebSearch));
sourceRoutes.post("/reprocess", asyncHandler(reprocessSources));
sourceRoutes.post("/:sourceId/reprocess", asyncHandler(reprocessSource));
sourceRoutes.get("/:sourceId/chunks", asyncHandler(getSourceChunks));
sourceRoutes.get("/", asyncHandler(listSources));
sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
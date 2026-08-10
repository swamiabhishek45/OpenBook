import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
    bulkDeleteSources,
    createSource,
    deleteSource,
    getSource, importWebsite, listSources,
    uploadPdf,

} from "../controllers/source.controller.js";
import { uploadSinglePdf } from "../middleware/upload.middleware.js";


export const sourceRoutes = Router({ mergeParams: true }); // source ka parent route -> workspace

sourceRoutes.post(
    "/upload",
    uploadSinglePdf,
    asyncHandler(uploadPdf),
);
sourceRoutes.post("/import/website", asyncHandler(importWebsite));
sourceRoutes.get("/", asyncHandler(listSources));
sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
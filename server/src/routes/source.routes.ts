import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
    bulkDeleteSources,
    createSource,
    deleteSource,
    getSource, listSources,

} from "../controllers/source.controller.js";


export const sourceRoutes = Router({ mergeParams: true }); // source ka parent route -> workspace


sourceRoutes.get("/", asyncHandler(listSources));
sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
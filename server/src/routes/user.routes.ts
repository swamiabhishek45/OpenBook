import { Router } from "express";
import { getUsage } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/usage", asyncHandler(getUsage));

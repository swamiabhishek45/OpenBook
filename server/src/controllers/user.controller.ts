import type { Request, Response } from "express";
import { getUserUsage } from "../services/usage.services.js";

/**
 * Handles HTTP GET request to fetch resource quota consumption and limits for the authenticated user.
 *
 * @param req - Express request with session user
 * @param res - Express response returning usage metrics for workspaces, sources, artifacts, and messages
 */
export async function getUsage(req: Request, res: Response) {
    const usage = await getUserUsage(req.session.user.id);
    res.json(usage);
}

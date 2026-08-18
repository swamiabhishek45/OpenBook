import type { Request, Response } from "express";
import { getUserUsage } from "../services/usage.services.js";

export async function getUsage(req: Request, res: Response) {
    const usage = await getUserUsage(req.session.user.id);
    res.json(usage);
}

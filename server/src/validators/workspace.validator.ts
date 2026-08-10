import { z } from "zod";

export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

export const createWorkspaceSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(500).optional(),
    icon: z.string().trim().max(8).optional(),
    defaultModel: z.enum(CHAT_MODELS).optional(),
});


export const updateWorkspaceSchema = createWorkspaceSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" },
);

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;


export const workspaceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
});
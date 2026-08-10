import { z } from "zod";

export const sourceTypeSchema = z.enum([
    "PDF",
    "WEBSITE",
    "YOUTUBE",
    "TEXT",
    "MARKDOWN",
]);

export const sourceStatusSchema = z.enum([
    "PENDING",
    "PROCESSING",
    "READY",
    "FAILED",
]);

export const workspaceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
});

export const sourceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
    sourceId: z.string().trim().min(1),
});

export const listSourcesQuerySchema = z.object({
    q: z.string().trim().optional(),
    type: sourceTypeSchema.optional(),
    status: sourceStatusSchema.optional(),
});

export const createTextSourceSchema = z.object({
    type: z.literal("TEXT"),
    title: z.string().trim().min(1, "Title is required").max(200),
    content: z.string().trim().min(1, "Content is required"),
});

export const createMarkdownSourceSchema = z.object({
    type: z.literal("MARKDOWN"),
    title: z.string().trim().min(1, "Title is required").max(200),
    content: z.string().trim().min(1, "Content is required"),
});

export const createSourceSchema = z.discriminatedUnion("type", [
    createTextSourceSchema,
    createMarkdownSourceSchema,
]);

export const importWebsiteSchema = z.object({
    url: z.string().trim().url("Enter a valid URL"),
    title: z.string().trim().max(200).optional(),
});

export const importYoutubeSchema = z.object({
    url: z.string().trim().min(1, "YouTube URL is required"),
    title: z.string().trim().max(200).optional(),
});

export const bulkDeleteSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).min(1),
});

export const reprocessSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).optional(),
});

export const importWebSearchSchema = z.object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1),
    url: z.string().trim().url(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type ListSourcesQuery = z.infer<typeof listSourcesQuerySchema>;
export type ImportWebsiteInput = z.infer<typeof importWebsiteSchema>;
export type ImportYoutubeInput = z.infer<typeof importYoutubeSchema>;
export type BulkDeleteSourcesInput = z.infer<typeof bulkDeleteSourcesSchema>;
export type ReprocessSourcesInput = z.infer<typeof reprocessSourcesSchema>;
export type ImportWebSearchInput = z.infer<typeof importWebSearchSchema>;
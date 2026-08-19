import { z } from "zod";

export const connectNotionSchema = z.object({
    token: z.string().min(1, "Notion token is required"),
});

export const importDriveFileSchema = z.object({
    fileId: z.string().min(1, "Google Drive file ID is required"),
});

export const importNotionPageSchema = z.object({
    pageId: z.string().min(1, "Notion page ID is required"),
});

export const exportNotionSchema = z.object({
    parentPageId: z.string().optional(),
});

export const integrationProviderParamSchema = z.object({
    provider: z.string().min(1),
});

export type ConnectNotionInput = z.infer<typeof connectNotionSchema>;
export type ImportDriveFileInput = z.infer<typeof importDriveFileSchema>;
export type ImportNotionPageInput = z.infer<typeof importNotionPageSchema>;
export type ExportNotionInput = z.infer<typeof exportNotionSchema>;

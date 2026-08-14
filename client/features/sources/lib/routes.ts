export const sourceRoutes = {
    list: (workspaceId: string) => `/workspace/${workspaceId}/sources`,
    detail: (workspaceId: string, sourceId: string) =>
        `/workspace/${workspaceId}/sources/${sourceId}`,
} as const;

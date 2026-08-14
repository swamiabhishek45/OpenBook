export type AppMemory = {
  id: string;
  memory: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
  source: "manual" | "learned";
};

export type CreateMemoryInput = {
  memory: string;
  infer?: boolean;
};

export type UpdateMemoryInput = {
  memory: string;
};

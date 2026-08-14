export type ArtifactType =
  | "SUMMARY"
  | "TAKEAWAYS"
  | "FLASHCARDS"
  | "QUIZ"
  | "MINDMAP"
  | "REPORT";

export type ArtifactStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MindmapNode {
  id: string;
  label: string;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ArtifactContent {
  markdown?: string;
  items?: string[];
  cards?: FlashcardItem[];
  questions?: QuizQuestion[];
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
  sections?: ReportSection[];
}

export interface LearningArtifact {
  id: string;
  workspaceId: string;
  type: ArtifactType;
  title: string;
  content?: ArtifactContent | null;
  sourceIds: string[];
  status: ArtifactStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

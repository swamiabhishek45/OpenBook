import { findChunksBySourceId } from "../repository/source-chunk.repository.js";
import { findSourceById } from "../repository/source.repository.js";
import { processArtifactById } from "../services/artifact.services.js";
import { summarizeConversationById } from "../services/conversation-memory.services.js";
import { chunkSourceContent, embedAndIndexSource, extractSourceContent, markSourceFailed, markSourceProcessing } from "../services/source-processing.services.js";
import { inngest } from "./client.js";


/**
 * Inngest durable background function triggered by `source/created`.
 * Coordinates the multi-step ETL pipeline: mark processing -> extract -> chunk -> embed & index in Pinecone.
 */
export const processSource = inngest.createFunction(
  {
      id: "process-source",
      retries: 3,
      triggers: [{ event: "source/created" }],
  },
  async ({ event, step }) => {
      const { sourceId } = event.data;

    //   STEP 1: mark source as processing {status: "PROCESSING"}
      await step.run("mark-processing", () => markSourceProcessing(sourceId));

      try {

        // STEP 2: it extract the content from the source
          const extracted = await step.run("extract-content", () =>
              extractSourceContent(sourceId),
          );

          // STEP 3: it starts chunking your content
          await step.run("chunk-content", () =>
              chunkSourceContent(
                  sourceId,
                  extracted.text,
                  extracted.pages,
              ),
          );

          // STEP 4: Create vectors and store in vector DB
          const result = await step.run("embed-and-index", async () => {
              const source = await findSourceById(sourceId);
              if (!source) {
                  throw new Error("Source not found");
              }

              const chunks = await findChunksBySourceId(sourceId);
              await embedAndIndexSource(source, chunks);

              return { chunkCount: chunks.length };
          });

          return { sourceId, status: "READY", ...result };
      } catch (error) {
          await step.run("mark-failed", async () => {
              const source = await findSourceById(sourceId);
              if (source) {
                  await markSourceFailed(sourceId, error, source.metadata);
              }
          });
          throw error;
      }
  },
);

/**
 * Inngest durable background function triggered by `conversation/summarize`.
 * Produces rolling summaries of long conversations and syncs user memory to Mem0.
 */
export const summarizeConversation = inngest.createFunction(
    {
        id: "summarize-conversation",
        retries: 2,
        triggers: [{ event: "conversation/summarize" }],
    },
    async ({ event, step }) => {
        const { conversationId, userId } = event.data;

        await step.run("summarize", () =>
            summarizeConversationById(conversationId, userId),
        );

        return { conversationId, status: "SUMMARIZED" };
    },
);

/**
 * Inngest durable background function triggered by `artifact/generate`.
 * Runs AI synthesis for study artifacts (quizzes, flashcards, mind maps, podcasts).
 */
export const generateArtifact = inngest.createFunction(
    {
        id: "generate-artifact",
        retries: 2,
        triggers: [{ event: "artifact/generate" }],
    },
    async ({ event, step }) => {
        const { artifactId } = event.data;

        await step.run("generate", () => processArtifactById(artifactId));

        return { artifactId, status: "READY" };
    },
);

export const functions = [processSource, summarizeConversation, generateArtifact];
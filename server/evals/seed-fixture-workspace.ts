/**
 * Optional helper: create sources in a dedicated eval workspace and print gold chunk IDs
 * for rag-v1.jsonl. Run manually after configuring DATABASE_URL and workspace id.
 *
 * Usage: RAG_EVAL_WORKSPACE_ID=<id> tsx evals/seed-fixture-workspace.ts
 */
console.log(
    "Seed eval fixtures by uploading sources to workspace",
    process.env.RAG_EVAL_WORKSPACE_ID ?? "(set RAG_EVAL_WORKSPACE_ID)",
);

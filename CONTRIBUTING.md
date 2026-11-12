# Contributing to OpenBook

Thank you for improving OpenBook. This guide covers local setup, quality checks, and how data flows through the system.

## Prerequisites

- Node.js 20+
- PostgreSQL (local, Docker, or hosted)
- API keys listed in `server/.env.example`

## Quick start (all services)

From the repository root:

```bash
npm install
npm install --prefix server
npm install --prefix client
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

### Database with Docker

```bash
docker compose up -d
```

Use this connection string in `server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/chaibook
```

Then apply the schema:

```bash
cd server
npx prisma db push
npx prisma generate
```

### Run development

```bash
# From repo root (Express + Inngest dev + Next.js)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API: [http://localhost:8081](http://localhost:8081).

On Windows PowerShell, prefer the root `npm run dev` script instead of chaining with `&&`.

## Architecture (source → answer)

1. **Ingestion** — PDFs, URLs, YouTube, notes, and integrations are parsed and chunked in `server/src/services/source.services.ts`.
2. **Embeddings** — Chunks are embedded and stored in Pinecone; metadata stays in Postgres via Prisma.
3. **Retrieval** — Chat and artifacts call `server/src/lib/rag/retrieve.ts` (hybrid search + optional rerank).
4. **Generation** — LLM prompts include retrieved chunks; citations are parsed in `server/src/lib/rag/citation-parse.ts`.
5. **Background jobs** — Long artifact and podcast pipelines run through Inngest (`server/src/inngest/`). Local dev requires `npm run inngest --prefix server` (included in root `npm run dev`).

## Quality checks

| Command | Where | Purpose |
|--------|--------|---------|
| `npm run typecheck --prefix server` | server | TypeScript |
| `npm run test:unit --prefix server` | server | Unit tests (RAG helpers, env) |
| `npm run eval:rag -- --workspace=<id>` | server | Live retrieval eval (needs Pinecone + seeded workspace) |
| `npm run lint --prefix client` | client | ESLint (fix existing violations before enforcing in CI) |
| `npm run build --prefix client` | client | Production build |
| `npm run test:e2e` | root | Playwright smoke tests |

CI runs server typecheck + unit tests, client lint + build, and Playwright smoke tests on every pull request.

## RAG evaluation

1. Create a dedicated workspace and upload representative sources.
2. Run `RAG_EVAL_WORKSPACE_ID=<id> tsx evals/seed-fixture-workspace.ts` and fill `goldChunkIds` in `server/evals/datasets/rag-v1.jsonl`.
3. Run `npm run eval:rag -- --dataset=rag-v1 --workspace=<id>`.
4. Baseline regression gates live in `server/evals/reports/rag-v1-baseline.json`.

## Pull requests

- Keep changes focused; match existing TypeScript and folder conventions.
- Do not commit secrets (`.env`, keys).
- Ensure CI passes before requesting review.

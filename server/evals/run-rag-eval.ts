import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { retrieveWorkspaceContext } from "../src/lib/rag/retrieve.js";

type EvalRow = {
    id: string;
    workspaceFixture: string;
    query: string;
    goldChunkIds?: string[];
    goldSourceIds?: string[];
    goldPages?: number[];
    notes?: string;
};

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDataset(name: string): EvalRow[] {
    const path = join(__dirname, "datasets", `${name}.jsonl`);
    const raw = readFileSync(path, "utf8");
    return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line) as EvalRow);
}

function precisionAtK(retrievedIds: string[], goldIds: string[], k: number) {
    if (k === 0) return 0;
    const top = retrievedIds.slice(0, k);
    const hits = top.filter((id) => goldIds.includes(id)).length;
    return hits / k;
}

function recallAtK(retrievedIds: string[], goldIds: string[], k: number) {
    if (goldIds.length === 0) return 0;
    const top = retrievedIds.slice(0, k);
    const hits = top.filter((id) => goldIds.includes(id)).length;
    return hits / goldIds.length;
}

function mrr(retrievedIds: string[], goldIds: string[]) {
    if (goldIds.length === 0) return 0;
    for (let i = 0; i < retrievedIds.length; i += 1) {
        if (goldIds.includes(retrievedIds[i]!)) {
            return 1 / (i + 1);
        }
    }
    return 0;
}

async function main() {
    const args = process.argv.slice(2);
    const datasetArg = args.find((arg) => arg.startsWith("--dataset="));
    const workspaceArg = args.find((arg) => arg.startsWith("--workspace="));
    const kArg = args.find((arg) => arg.startsWith("--k="));

    const datasetName = datasetArg?.split("=")[1] ?? "rag-v1";
    const workspaceId =
        workspaceArg?.split("=")[1] ??
        process.env.RAG_EVAL_WORKSPACE_ID ??
        "";
    const k = Number(kArg?.split("=")[1] ?? 6);

    if (!workspaceId) {
        console.error(
            "Missing workspace id. Pass --workspace=<id> or set RAG_EVAL_WORKSPACE_ID.",
        );
        process.exit(1);
    }

    const rows = loadDataset(datasetName);
    const perQuery: Record<string, unknown>[] = [];

    let precisionSum = 0;
    let recallSum = 0;
    let mrrSum = 0;
    let evaluated = 0;

    for (const row of rows) {
        const gold = row.goldChunkIds ?? [];
        if (gold.length === 0) {
            perQuery.push({
                id: row.id,
                skipped: true,
                reason: "no goldChunkIds",
            });
            continue;
        }

        const retrieved = await retrieveWorkspaceContext(workspaceId, row.query);
        const retrievedIds = retrieved.map((chunk) => chunk.chunkId);
        const p = precisionAtK(retrievedIds, gold, k);
        const r = recallAtK(retrievedIds, gold, k);
        const m = mrr(retrievedIds, gold);

        precisionSum += p;
        recallSum += r;
        mrrSum += m;
        evaluated += 1;

        perQuery.push({
            id: row.id,
            query: row.query,
            precision_at_k: p,
            recall_at_k: r,
            mrr: m,
            retrievedIds,
        });
    }

    const summary = {
        dataset: datasetName,
        workspaceId,
        k,
        evaluated,
        retrieval_precision_at_k: evaluated ? precisionSum / evaluated : 0,
        retrieval_recall_at_k: evaluated ? recallSum / evaluated : 0,
        mrr: evaluated ? mrrSum / evaluated : 0,
        perQuery,
    };

    const reportsDir = join(__dirname, "reports");
    mkdirSync(reportsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = join(reportsDir, `${datasetName}-${stamp}.json`);
    writeFileSync(reportPath, JSON.stringify(summary, null, 2));

    console.log(JSON.stringify(summary, null, 2));
    console.log(`Report written to ${reportPath}`);

    const baselinePath = join(reportsDir, `${datasetName}-baseline.json`);
    try {
        const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as {
            retrieval_precision_at_k?: number;
        };
        const drop =
            (baseline.retrieval_precision_at_k ?? 0) -
            summary.retrieval_precision_at_k;
        if (drop > 0.05) {
            console.error(
                `Precision@k dropped by ${drop.toFixed(3)} vs baseline.`,
            );
            process.exit(2);
        }
    } catch {
        console.warn(`No baseline file at ${baselinePath}; skip regression gate.`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

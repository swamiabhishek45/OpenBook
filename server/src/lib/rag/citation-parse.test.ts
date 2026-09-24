import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    applyCitationFallback,
    parseWebCitationIndices,
    parseWorkspaceCitationIndices,
    resolveCitationsFromRetrieval,
} from "./citation-parse.js";
import type { RetrievedChunk } from "./reconcile.js";

const sampleChunks: RetrievedChunk[] = [
    {
        sourceId: "s1",
        sourceTitle: "Doc A",
        sourceType: "PDF",
        chunkId: "c1",
        chunkIndex: 0,
        text: "alpha",
        score: 0.9,
    },
    {
        sourceId: "s2",
        sourceTitle: "Doc B",
        sourceType: "NOTE",
        chunkId: "c2",
        chunkIndex: 1,
        text: "beta",
        score: 0.5,
    },
];

describe("citation-parse", () => {
    it("parses workspace citation indices", () => {
        const indices = parseWorkspaceCitationIndices(
            "Revenue grew [1] and margins [2, 3] improved.",
        );
        assert.deepEqual(indices, [1, 2, 3]);
    });

    it("parses web citation indices", () => {
        const indices = parseWebCitationIndices("News says [W1] and [W2].");
        assert.deepEqual(indices, [1, 2]);
    });

    it("resolves citations from retrieval order", () => {
        const citations = resolveCitationsFromRetrieval(sampleChunks, [2]);
        assert.equal(citations.length, 1);
        assert.equal(citations[0]?.chunkId, "c2");
        assert.equal(citations[0]?.index, 2);
    });

    it("applies fallback when model cites nothing", () => {
        const citations = applyCitationFallback(sampleChunks, []);
        assert.equal(citations.length, 1);
        assert.equal(citations[0]?.chunkId, "c1");
    });
});

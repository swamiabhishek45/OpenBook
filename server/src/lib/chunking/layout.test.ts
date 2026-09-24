import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { segmentIntoLayoutBlocks } from "./layout.js";

describe("layout chunking", () => {
    it("keeps markdown tables as a single table block", () => {
        const text = `Intro line\n| Col A | Col B |\n| --- | --- |\n| 1 | 2 |\nAfter table`;
        const blocks = segmentIntoLayoutBlocks(text);
        const table = blocks.find((block) => block.type === "table");
        assert.ok(table);
        assert.match(table!.content, /\| Col A \| Col B \|/);
    });
});

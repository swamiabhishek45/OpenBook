import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("getServerEnv", () => {
    it("requires DATABASE_URL and BETTER_AUTH_SECRET length", async () => {
        const previous = { ...process.env };
        process.env.DATABASE_URL = "postgresql://localhost:5432/openbook";
        process.env.BETTER_AUTH_SECRET = "x".repeat(32);
        process.env.CLIENT_URL = "http://localhost:3000";
        process.env.NODE_ENV = "development";

        const { getServerEnv, resetServerEnvCacheForTests } =
            await import("./env.js");
        resetServerEnvCacheForTests();
        const env = getServerEnv();
        assert.equal(env.PORT, 8081);

        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });
});

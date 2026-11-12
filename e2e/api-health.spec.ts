import { test, expect } from "@playwright/test";

const serverBase =
  process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8081";

test("API health reports database status", async ({ request }) => {
  const response = await request.get(`${serverBase}/health`);
  expect(response.status()).toBeLessThan(600);
  const body = (await response.json()) as {
    status: string;
    checks: { database: string };
  };
  expect(body.status).toMatch(/ok|degraded/);
  expect(body.checks.database).toBeDefined();
});

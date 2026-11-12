import { test, expect } from "@playwright/test";

test.describe("marketing", () => {
  test("home page hero and auth links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("that talks back.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/pricing/);
  });
});

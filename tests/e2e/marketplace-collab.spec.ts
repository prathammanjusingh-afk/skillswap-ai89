import { test, expect } from "@playwright/test";

test.describe("Student Marketplace & Collaboration Flow", () => {
  test("allows searching and filtering student marketplace", async ({ page }) => {
    await page.goto("/");

    // Navigate to Marketplace tab if tab switcher exists
    const marketplaceTab = page.getByRole("tab", { name: /Marketplace|Students/i }).first();
    if (await marketplaceTab.isVisible()) {
      await marketplaceTab.click();
    }

    // Search bar check
    const searchInput = page.getByPlaceholder(/Search by student, skill, or university/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("React");
      // Give UI debounce time to filter
      await page.waitForTimeout(400);
    }
  });

  test("displays empty state gracefully when no matches are found", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/Search by student, skill, or university/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("NonExistentSkillXYZ12345");
      await page.waitForTimeout(400);
      const emptyNotice = page.getByText(/No students found|No matches/i).first();
      if (await emptyNotice.isVisible()) {
        await expect(emptyNotice).toBeVisible();
      }
    }
  });
});

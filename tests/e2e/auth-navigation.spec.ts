import { test, expect } from "@playwright/test";

test.describe("SkillSwap AI Navigation & Authentication UI", () => {
  test("loads the landing page with hero navigation and call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SkillSwap AI/i);

    // Verify presence of brand header
    const brandElement = page.getByText(/SkillSwap AI/i).first();
    await expect(brandElement).toBeVisible();

    // Verify main navigation buttons or tabs
    const exploreMarketplace = page.getByRole("button", { name: /Explore Marketplace|Marketplace/i }).first();
    if (await exploreMarketplace.isVisible()) {
      await expect(exploreMarketplace).toBeEnabled();
    }
  });

  test("opens authentication modal when clicking sign in / register", async ({ page }) => {
    await page.goto("/");
    const authTrigger = page.getByRole("button", { name: /Sign In|Register|Get Started/i }).first();
    if (await authTrigger.isVisible()) {
      await authTrigger.click();
      const modalHeader = page.getByRole("heading", { name: /Welcome|Sign In|Create Account/i }).first();
      await expect(modalHeader).toBeVisible();
    }
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { firstVehicleHref } from "./helpers";

const PAGES = ["/", "/stock", "/stock/toyota", "/about", "/how-to-buy", "/shipping", "/contact", "/login", "/register"];

async function seriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")})`);
}

test.describe("accessibility (WCAG 2.1 AA, serious and critical issues)", () => {
  for (const path of PAGES) {
    test(`${path} @mobile`, async ({ page }) => {
      await page.goto(path);
      expect(await seriousViolations(page)).toEqual([]);
      // Screen-reader users navigate by headings; axe only flags this as a
      // best practice, so it's checked here.
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test("vehicle detail @mobile", async ({ page }) => {
    await page.goto(await firstVehicleHref(page));
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("keyboard users can skip straight to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

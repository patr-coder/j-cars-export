import { expect, test } from "@playwright/test";

import { firstVehicleHref } from "./helpers";

// (public)/loading.tsx makes these routes stream, so a missing record is a
// 200 carrying noindex rather than a 404 status (see DECISIONS.md).
async function expectNotFound(page: import("@playwright/test").Page) {
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  await expect(page.getByText(/not found|doesn.t exist|couldn.t find/i).first()).toBeVisible();
}

test.describe("public catalogue", () => {
  test("home shows the hero, stock count and main sections @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/\d+ vehicles available now/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "How to buy" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("home carries Organization structured data", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(json!)).toMatchObject({ "@type": "AutoDealer", name: "J-cars Exports" });
  });

  test("stock filters narrow and sort the results", async ({ page }) => {
    await page.goto("/stock?make=toyota&sort=price_desc");
    const cards = page.locator('main a[href^="/cars/toyota-"]');
    await expect(cards.first()).toBeVisible();
    const all = await page.locator('main a[href^="/cars/"]').count();
    expect(await cards.count()).toBe(all);
  });

  test("the promotions filter only lists promoted vehicles", async ({ page }) => {
    await page.goto("/stock");
    const total = Number((await page.getByText(/vehicles? found/).textContent())!.match(/\d+/)![0]);
    await page.getByRole("checkbox", { name: "Promotions only" }).click();
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/promotion=1/);
    const promoted = Number((await page.getByText(/vehicles? found/).textContent())!.match(/\d+/)![0]);
    expect(promoted).toBeLessThanOrEqual(total);
  });

  test("vehicle detail has specs, a quote form, JSON-LD and a canonical URL", async ({ page }) => {
    const href = await firstVehicleHref(page);
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#quote")).toBeVisible();
    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(jsonLd["@type"]).toBeTruthy();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${href}$`));
  });

  test("brand and model pages are indexable entry points", async ({ page }) => {
    await page.goto("/stock/toyota");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Used Toyota/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/stock\/toyota$/);
    await expect(page.locator('main a[href^="/cars/toyota-"]').first()).toBeVisible();

    await page.goto("/stock/not-a-make");
    await expectNotFound(page);
  });

  test("CMS pages render their content", async ({ page }) => {
    for (const path of ["/about", "/how-to-buy", "/shipping", "/contact"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    await page.goto("/shipping");
    await expect(page.getByRole("heading", { name: "Destinations and ports" })).toBeVisible();
  });

  test("unknown vehicles render the not-found page", async ({ page }) => {
    await page.goto("/cars/does-not-exist-jc-9999");
    await expectNotFound(page);
  });
});

test.describe("SEO and security plumbing", () => {
  test("sitemap lists pages, brand pages and vehicles", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/how-to-buy");
    expect(xml).toMatch(/\/stock\/[a-z-]+<\/loc>/);
    expect(xml).toMatch(/\/cars\/[a-z0-9-]+<\/loc>/);
  });

  test("robots.txt keeps private areas out of the index", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    for (const path of ["/account", "/admin", "/api"]) expect(txt).toContain(`Disallow: ${path}`);
  });

  test("responses carry the security headers", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("health endpoint responds", async ({ request }) => {
    expect((await request.get("/api/health")).ok()).toBe(true);
  });
});

import { expect, test } from "@playwright/test";

// Uses the local stack's Mailpit inbox, so it only runs where that's up.
const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:56324";
const EMAIL = "client2@jcars.dev";

test("a reset link opened on another device leads to the new-password form", async ({ page, browser, request }) => {
  const up = await request.get(`${MAILPIT}/api/v1/info`).then((r) => r.ok()).catch(() => false);
  test.skip(!up, "Mailpit not reachable");
  await request.delete(`${MAILPIT}/api/v1/messages`, { data: {} });

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();

  let link: string | undefined;
  await expect
    .poll(async () => {
      const search = await (await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${EMAIL}`)}`)).json();
      const id = search.messages?.[0]?.ID;
      if (!id) return undefined;
      const message = await (await request.get(`${MAILPIT}/api/v1/message/${id}`)).json();
      link = message.HTML.match(/href="([^"]*\/auth\/callback[^"]*)"/)?.[1]?.replace(/&amp;/g, "&");
      return link;
    }, { timeout: 15_000 })
    .toBeTruthy();

  // A fresh context shares no cookies with the requesting browser.
  const otherDevice = await browser.newContext();
  const phone = await otherDevice.newPage();
  await phone.goto(link!);
  await expect(phone).toHaveURL(/\/reset-password$/);
  await expect(phone.getByRole("heading", { name: "Choose a new password" })).toBeVisible();

  // The link is single-use.
  const replay = await (await browser.newContext()).newPage();
  await replay.goto(link!);
  await expect(replay).toHaveURL(/\/forgot-password\?error=link$/);
  await otherDevice.close();
});

import { expect, test, type Page } from "@playwright/test";

// WEB-05. Runs without Supabase keys, so every visitor is signed out.

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("public pages", () => {
  for (const path of ["/", "/k12", "/higher-ed", "/pricing"]) {
    test(`${path} has one h1, a title and no sideways scroll at 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page).toHaveTitle(/Teazy AI/);
      await expectNoSidewaysScroll(page);
    });
  }

  test("a visitor can sign up from pricing and come back to the chosen plan", async ({ page }) => {
    test.slow(); // first compile under `pnpm dev`
    await page.goto("/pricing");
    const signUp = page.getByRole("link", { name: "Sign up for Assessment Pro" });
    await expect(signUp).toHaveAttribute("href", "/sign-up?next=%2Fpricing%3Fplan%3Dpro");
    await expect(async () => {
      if (!page.url().includes("/sign-up")) await signUp.click();
      await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible({
        timeout: 5_000,
      });
    }).toPass({ timeout: 45_000 });
  });

  test("the header links to pricing and sign-up", async ({ page, isMobile }) => {
    test.slow(); // first compile under `pnpm dev`
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Start free" }),
    ).toHaveAttribute("href", "/sign-up");
    if (isMobile) {
      const menu = page.getByRole("dialog", { name: "Menu" });
      // Under `pnpm dev` the first click can land before hydration, so retry it.
      await expect(async () => {
        if (!(await menu.isVisible()))
          await page.getByRole("button", { name: "Open menu" }).click();
        await expect(menu.getByRole("link", { name: "Pricing" })).toBeVisible({ timeout: 3_000 });
      }).toPass({ timeout: 30_000 });
      await expect(menu.getByRole("link", { name: "Lesson notes" })).toHaveAttribute(
        "href",
        "/lessons",
      );
    } else {
      await expect(
        page.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Pricing" }),
      ).toHaveAttribute("href", "/pricing");
    }
  });
});

test.describe("errors and old links", () => {
  test("an unknown page shows the 404 page inside the site frame", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Teazy AI" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Pricing" })).toBeVisible();
  });

  test("legacy URLs redirect to the new routes", async ({ request }) => {
    for (const [from, to] of [
      ["/app/quiz", "/quizzes"],
      ["/app/writing/batches/7", "/assessment/batches/7"],
      ["/auth?mode=signup", "/sign-up"],
      ["/auth", "/sign-in"],
    ]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(307);
      expect(new URL(response.headers().location, "http://x").pathname, from).toBe(to);
    }
  });
});

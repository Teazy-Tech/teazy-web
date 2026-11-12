import { defineConfig, devices } from "@playwright/test";

// E2E tests (QA-01). Locally they start `pnpm dev`; in CI set E2E_BASE_URL to
// the Vercel preview URL instead.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    // Teachers mostly use mid-range Android phones, so mobile is the default project.
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "pnpm dev", url: baseURL, reuseExistingServer: !process.env.CI },
});

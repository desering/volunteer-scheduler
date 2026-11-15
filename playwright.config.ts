import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // not *.spec.ts, so `bun test` doesn't pick these files up
  testMatch: "**/*.e2e.ts",
  retries: process.env.CI ? 2 : 0,
  // fail the run after an hour, so that the reporters still produce a report
  globalTimeout: 60 * 60 * 1000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? "bun run --bun build && bun run --bun start"
      : "bun run --bun dev",
    url: "http://localhost:3000/health/ready",
    stdout: "pipe",
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

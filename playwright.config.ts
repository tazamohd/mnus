import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // The Express server sends a strict CSP that blocks Vite's inline scripts
    // (React refresh preamble). bypassCSP lets the test browser mount React normally.
    bypassCSP: true,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Required in Replit/sandbox environments where Chromium cannot use setuid sandbox
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        },
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

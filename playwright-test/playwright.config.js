// playwright.config.*
// @ts-check
// Quick tour:
// - testDir + testMatch tell Playwright where specs live
// - baseURL falls back to http://localhost:8000 unless env overrides it
// - reporters: console list + HTML + Allure
// - projects: chromium/firefox/webkit with similar settings
import { defineConfig, devices } from "@playwright/test";
import path from "path";
const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

export default defineConfig({
  testDir: "tests",
  testMatch: ["**/tests/specs/**/*.spec.js"],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  globalSetup: require.resolve(
    resolvePath("tests", "support", "utils", "report-clean.js")
  ),

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    [
      "allure-playwright",
      {
        outputFolder: "allure-results",
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      process.env.BASE_URL ||
      "http://localhost:8000",
    // Flip this on with IGNORE_HTTPS_ERRORS=1 if using self-signed certs locally
    ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === "1",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        trace: "on-first-retry",
        timeout: 15000, // per-test timeout override
        launchOptions: {
          args: [
            "--no-proxy-server", // force direct, ignore env proxies
            "--disable-features=HttpsUpgrades", // prevent auto https upgrades
          ],
        },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        trace: "on-first-retry",
        timeout: 15000,
        launchOptions: {
          args: [
            "--no-proxy-server", // force direct, ignore env proxies
            "--disable-features=HttpsUpgrades", // prevent auto https upgrades
          ],
        },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        trace: "on-first-retry",
        timeout: 15000,
        launchOptions: {
          args: [
            "--no-proxy-server", // force direct, ignore env proxies
            "--disable-features=HttpsUpgrades", // prevent auto https upgrades
          ],
        },
      },
    },
  ],
});

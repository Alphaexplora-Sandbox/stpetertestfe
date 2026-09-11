import { defineConfig, devices } from '@playwright/test';

/**
 * E2E_BASE_URL is set by the central playwright-e2e workflow to the deployed
 * URL for the branch under test. When it is absent - a developer running the
 * suite locally - the config starts a preview server instead, so the same
 * command works in both places.
 */
const deployedUrl = process.env.E2E_BASE_URL?.trim();
// localhost, not 127.0.0.1: `vite preview` binds the hostname, which
// resolves to ::1 first on Windows, so the IPv4 literal never answers and
// the suite dies on a webServer timeout that looks like a broken build.
const localUrl = 'http://localhost:4173';

// The workflow runs one browser per matrix job and passes which one. Honouring
// it keeps the shards from each running all three.
const browser = process.env.PLAYWRIGHT_BROWSER ?? 'chromium';
const engine =
  browser === 'firefox'
    ? devices['Desktop Firefox']
    : browser === 'webkit'
      ? devices['Desktop Safari']
      : devices['Desktop Chrome'];

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e-spec.ts',
  // A suite that silently runs zero tests reports success. Failing instead
  // means a rename or a bad glob is caught here rather than mistaken for a
  // clean run.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: deployedUrl || localUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: browser, use: { ...engine } }],
  // Only started when there is no deployed URL to test. Against a real
  // deployment this must not run, or the suite would quietly test localhost
  // and report the deployment as healthy.
  ...(deployedUrl
    ? {}
    : {
        webServer: {
          command: 'npm run preview',
          url: localUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});

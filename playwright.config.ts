import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: [
    {
      command: 'node tests/e2e/mock-server.mjs',
      port: 54430,
      reuseExistingServer: false,
    },
    {
      command:
        'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100/admin',
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54430',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test',
        SUPABASE_SERVICE_ROLE_KEY: 'service-test',
        ADMIN_PASSWORD: 'browser-test-password-very-strong',
        PANEL_SITE_URL: 'http://127.0.0.1:3100',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_GA_ID: 'G-TEST12345',
      },
    },
  ],
})

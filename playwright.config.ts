import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: true,
  workers: 2,
  retries: 0,
  reporter: 'list',
  use: { browserName: 'chromium', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'empty', use: { baseURL: 'http://127.0.0.1:4173' } },
    { name: 'seeded', use: { baseURL: 'http://127.0.0.1:4174' } },
  ],
  webServer: [4173, 4174].map((port, index) => ({
    command: `node node_modules/vite/bin/vite.js preview --outDir .tmp/e2e/${index ? 'seeded' : 'empty'}/dist --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 30000,
  })),
});

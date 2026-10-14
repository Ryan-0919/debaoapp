import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', {open: 'never'}]],
  use: {
    baseURL: 'http://127.0.0.1:8002',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {name: 'desktop-chrome', use: {viewport: {width: 1440, height: 1000}}},
    {name: 'mobile-chrome', use: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}},
  ],
  webServer: [
    {command: 'npm.cmd run dev', cwd: '../debao-server', url: 'http://127.0.0.1:4000/v1/health', reuseExistingServer: true, timeout: 120_000},
    {command: 'pnpm.cmd dev', cwd: '.', url: 'http://127.0.0.1:8002', reuseExistingServer: true, timeout: 120_000, env: {PORT: '8002'}},
  ],
});

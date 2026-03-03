import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // 순차 실행
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // 한 번에 하나씩
  reporter: 'list',
  
  use: {
    baseURL: 'https://policenthief-ten.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser',
  use:{baseURL:'http://127.0.0.1:3000',...devices['iPhone 13'],defaultBrowserType:'chromium'},
  webServer:{command:'npm run start',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI},
});

import { test, expect } from '@playwright/test';
import { launchElectron } from '../helpers';

test('switching theme via UI changes the --bg-primary CSS variable', async () => {
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  const getBgPrimary = () =>
    win.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-primary')
        .trim(),
    );

  const before = await getBgPrimary();

  // Open the theme panel
  await win.click('#btn-theme');
  await expect(win.locator('#theme-panel')).toBeVisible({ timeout: 5000 });

  // Click a built-in theme that is NOT the current active one.
  // "GitHub Light" has a bright background that differs from the dark default.
  const githubLight = win.locator('#theme-list .theme-item').filter({ hasText: 'GitHub Light' });
  await expect(githubLight).toBeVisible({ timeout: 3000 });
  await githubLight.click();

  const after = await getBgPrimary();
  expect(after).not.toBe(before);

  await app.close();
});

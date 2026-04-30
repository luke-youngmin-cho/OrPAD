import { test, expect } from '@playwright/test';
import { launchElectron } from '../helpers';

test('middle-click on a tab closes it', async () => {
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  // Open two tabs
  await win.keyboard.press('Control+n');
  await expect(win.locator('.tab-item')).toHaveCount(1, { timeout: 5000 });
  await win.keyboard.press('Control+n');
  await expect(win.locator('.tab-item')).toHaveCount(2, { timeout: 5000 });

  // Middle-click the first tab to close it
  await win.locator('.tab-item').first().click({ button: 'middle' });

  await expect(win.locator('.tab-item')).toHaveCount(1, { timeout: 5000 });

  await app.close();
});

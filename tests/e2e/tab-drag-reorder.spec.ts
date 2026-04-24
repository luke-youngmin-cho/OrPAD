import { test, expect } from '@playwright/test';
import * as path from 'path';
import { launchElectron } from '../helpers';

test('drag a tab between two others; order updates', async () => {
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  // Open three fixture files so tabs have distinct names
  const fixtures = [
    path.resolve('tests/fixtures/sample.json'),
    path.resolve('tests/fixtures/sample.csv'),
    path.resolve('tests/fixtures/sample.yaml'),
  ];
  for (const fp of fixtures) {
    await win.evaluate((p: string) => window.formatpad.dropFile(p), fp);
    await win.waitForTimeout(200);
  }

  await expect(win.locator('.tab-item')).toHaveCount(3, { timeout: 8000 });

  const tabs = win.locator('.tab-item');
  const firstNameBefore = await tabs.nth(0).locator('.tab-name').textContent();

  // Drag first tab onto the third tab
  await tabs.nth(0).dragTo(tabs.nth(2));

  // After reorder, the first slot should contain a different file
  const firstNameAfter = await tabs.nth(0).locator('.tab-name').textContent();
  expect(firstNameAfter).not.toBe(firstNameBefore);

  await app.close();
});

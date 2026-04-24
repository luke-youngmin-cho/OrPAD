import { test, expect } from '@playwright/test';
import * as path from 'path';
import { launchElectron } from '../helpers';

test('mermaid fenced block renders an SVG in preview', async () => {
  const fixturePath = path.resolve('tests/fixtures/sample-mermaid.md');
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  await win.evaluate((p: string) => window.formatpad.dropFile(p), fixturePath);

  const preview = win.locator('#content');
  // Mermaid renders asynchronously; allow generous timeout
  await expect(preview.locator('svg').first()).toBeVisible({ timeout: 20000 });

  await app.close();
});

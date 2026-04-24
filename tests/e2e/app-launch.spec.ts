import { test, expect } from '@playwright/test';
import { launchElectron } from '../helpers';

test('desktop app launches, window title contains FormatPad', async () => {
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  await expect(win).toHaveTitle(/FormatPad/);

  await app.close();
});

import { test, expect } from '@playwright/test';
import { launchElectron } from '../helpers';

test('recovery file is written for unsaved changes', async () => {
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  // Trigger the recovery-save IPC path (simulates the 30 s auto-save timer)
  await win.evaluate(async () => {
    await window.formatpad.autoSaveRecovery(null, '# Recovery smoke test\n\nUnsaved content.');
  });

  // Verify the recovery file was written in the app userData directory
  const hasRecovery = await app.evaluate(async ({ app: electronApp }) => {
    const nodePath = require('path') as typeof import('path');
    const nodeFs   = require('fs/promises') as typeof import('fs/promises');
    const dir = nodePath.join(electronApp.getPath('userData'), 'recovery');
    const files = await nodeFs.readdir(dir).catch(() => [] as string[]);
    return files.some((f: string) => f.endsWith('.json'));
  });

  expect(hasRecovery).toBe(true);

  await app.close();
});
